'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function CityPage({ params }) {
  const router = useRouter();

  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Get country and city from URL params
  const { country, city } = params;
  const decodedCountry = decodeURIComponent(country);
  const decodedCity = decodeURIComponent(city);

  useEffect(() => {
    if (!decodedCountry || !decodedCity) {
      setError('Country and city are required');
      setLoading(false);
      return;
    }

    async function fetchCityImages() {
      try {
        const response = await fetch('/api/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ country: decodedCountry, city: decodedCity }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch city images');
        }

        const data = await response.json();
        setCityData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching city images:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchCityImages();
  }, [decodedCountry, decodedCity]);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleBackClick = () => {
    // Go back to the country page instead of the main gallery
    router.push('/gallery');

    // This simulates going back to the country view in the gallery page
    // by using localStorage to remember the selected country
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCountry', decodedCountry);
    }
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading photos from {decodedCity}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Home button in the upper left */}
      <div className="absolute top-4 left-4">
        <Link href="/">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Home
          </button>
        </Link>
      </div>

      <div className="mb-6 flex items-center mt-16">
        <button
          onClick={handleBackClick}
          className="mr-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          ← Back to {decodedCountry}
        </button>
        <h1 className="text-2xl font-bold">
          Photos from {decodedCity}, {decodedCountry}
        </h1>
      </div>

      {/* Image gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cityData?.images && cityData.images.length > 0 ? (
          cityData.images.map((image, index) => (
            <div
              key={image.name || index}
              className="cursor-pointer transform transition-transform hover:scale-105"
              onClick={() => handleImageClick(image)}
            >
              <div className="relative h-64 rounded-lg overflow-hidden shadow-md">
                <Image
                  src={image.path}
                  alt={`Photo ${index + 1} from ${decodedCity}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-xl">No images found for this city.</p>
          </div>
        )}
      </div>

      {/* Full-size image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div className="relative max-w-6xl w-full h-full max-h-screen p-4 flex items-center justify-center">
            <button
              className="absolute top-4 right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseModal();
              }}
            >
              ×
            </button>
            <div className="relative w-full h-5/6" onClick={(e) => e.stopPropagation()}>
              <Image
                src={selectedImage.path}
                alt={selectedImage.name || 'Full size image'}
                fill
                sizes="100vw"
                style={{ objectFit: 'contain' }}
                priority
                quality={90}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}