'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

// Function to properly decode URL components
function decodeURIComponentSafe(str) {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
}

// Add skeleton loader for better UX
const ImageSkeleton = () => (
    <div className="relative w-full pb-[66.67%] rounded-lg overflow-hidden shadow-lg bg-gray-200 animate-pulse"></div>
);

export default function CityGalleryPage() {
  const params = useParams();
  const rawCountry = params.country;
  const rawCity = params.city;
  const country = decodeURIComponentSafe(rawCountry);
  const city = decodeURIComponentSafe(rawCity);

  const router = useRouter();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fullImageLoading, setFullImageLoading] = useState(false);

  useEffect(() => {
    async function fetchCityImages() {
      try {
        const response = await fetch('/api/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ country, city }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch city images');
        }

        const data = await response.json();

        // Process images to add thumbnail URLs
        if (data.images && Array.isArray(data.images)) {
          const processedImages = data.images.map(image => ({
            ...image,
            // Store the original URL for full-size viewing
            originalUrl: image.url,
            // Create thumbnail URL by replacing Final/ with thumbnails/
            url: image.thumbnailUrl || image.url.replace('Final/', 'thumbnails/')
          }));

          setImages(processedImages);
        } else {
          setImages([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching city images:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    if (country && city) {
      fetchCityImages();
    }
  }, [country, city]);

  const handleBackToCountry = () => {
    // Navigate back to the gallery with the country selected
    router.push('/gallery');

    // Store the country in sessionStorage so the gallery page can show it
    if (country) {
      sessionStorage.setItem('selectedCountry', country);
    }
  };

  // Handle clicking on an image to view full-size
  const handleImageClick = (image) => {
    setFullImageLoading(true);
    setSelectedImage(image);

    // Use window.Image to access the browser's native Image constructor
    // This fixes the conflict with Next.js Image component
    const preloadImage = new window.Image();
    preloadImage.src = image.originalUrl;
    preloadImage.onload = () => {
      setFullImageLoading(false);
    };
    preloadImage.onerror = () => {
      setFullImageLoading(false);
    };
  };

  // Close the full-size image view
  const handleCloseFullView = () => {
    setSelectedImage(null);
  };

  // Navigate to next or previous image
  const handleNavigate = (direction) => {
    if (!selectedImage) return;

    const currentIndex = images.findIndex(img => img.name === selectedImage.name);
    let newIndex;

    if (direction === 'next') {
      newIndex = (currentIndex + 1) % images.length;
    } else {
      newIndex = (currentIndex - 1 + images.length) % images.length;
    }

    handleImageClick(images[newIndex]);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedImage) return;

      if (e.key === 'Escape') {
        handleCloseFullView();
      } else if (e.key === 'ArrowRight') {
        handleNavigate('next');
      } else if (e.key === 'ArrowLeft') {
        handleNavigate('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage, images]);

  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="container mx-auto px-4 py-8 relative">
            {/* Back button */}
            <div className="absolute top-4 left-4">
              <button
                  onClick={handleBackToCountry}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-600 rounded-lg transition-colors text-white"
              >
                ← Back to Cities
              </button>
            </div>

            <h1 className="text-3xl font-bold mb-2 text-center pt-12 text-gray-800">{city}</h1>
            <h2 className="text-xl mb-8 text-center text-gray-600">{country}</h2>

            {/* Skeleton loader grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(12)].map((_, index) => (
                  <ImageSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
          <p className="text-xl text-red-600">Error: {error}</p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Full-size image modal overlay */}
        {selectedImage && (
            <div
                className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
                onClick={handleCloseFullView}
            >
              {/* Close button */}
              <button
                  className="absolute top-4 right-4 text-white bg-gray-800 bg-opacity-70 rounded-full w-10 h-10 flex items-center justify-center z-10"
                  onClick={handleCloseFullView}
              >
                ✕
              </button>

              {/* Navigation buttons */}
              <button
                  className="absolute left-4 text-white bg-gray-800 bg-opacity-70 rounded-full w-12 h-12 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate('prev');
                  }}
              >
                ←
              </button>
              <button
                  className="absolute right-4 text-white bg-gray-800 bg-opacity-70 rounded-full w-12 h-12 flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate('next');
                  }}
              >
                →
              </button>

              {/* Loading indicator */}
              {fullImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                  </div>
              )}

              {/* Full-size image container */}
              <div
                  className="relative w-full max-w-6xl h-[80vh]"
                  onClick={(e) => e.stopPropagation()}
              >
                <Image
                    src={selectedImage.originalUrl}
                    alt={`${city} - ${selectedImage.name}`}
                    fill
                    style={{ objectFit: 'contain' }}
                    sizes="100vw"
                    priority
                />
              </div>

              {/* Image info footer */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white py-2 px-4 text-center">
                <p>{selectedImage.name}</p>
              </div>
            </div>
        )}

        <div className="container mx-auto px-4 py-8 relative">
          {/* Back button in the top left */}
          <div className="absolute top-4 left-4">
            <button
                onClick={handleBackToCountry}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-600 rounded-lg transition-colors text-white"
            >
              ← Back to Cities
            </button>
          </div>

          <h1 className="text-3xl font-bold mb-2 text-center pt-12 text-gray-800">{city}</h1>
          <h2 className="text-xl mb-8 text-center text-gray-600">{country}</h2>

          {/* Image grid with thumbnails */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image) => (
                <div
                    key={image.name}
                    className="transform transition-transform hover:scale-105 cursor-pointer"
                    onClick={() => handleImageClick(image)}
                >
                  {/* Using a 3:2 aspect ratio container (pb-[66.67%]) */}
                  <div className="relative w-full pb-[66.67%] rounded-lg overflow-hidden shadow-lg group">
                    <Image
                        src={image.url} // Using thumbnail URL
                        alt={`${city} - ${image.name}`}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCAAIAAoBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAA/AL+A/9k="
                    />
                    {/* Optional overlay to indicate image is clickable */}
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  </div>
                </div>
            ))}
          </div>

          {images.length === 0 && (
              <div className="text-center py-10">
                <p className="text-xl text-gray-800">No images found for this location.</p>
              </div>
          )}
        </div>

        {/* Footer - Consistent with other pages */}
        <footer className="py-8 px-4 bg-gray-800 text-white rounded-t-lg mt-12">
          <div className="max-w-6xl mx-auto text-center">
            <p>© {new Date().getFullYear()} 333Treks. All rights reserved.</p>
          </div>
        </footer>
      </div>
  );
}