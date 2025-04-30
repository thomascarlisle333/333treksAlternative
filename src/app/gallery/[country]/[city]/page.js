'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
    router.push(`/gallery/${encodeURIComponent(decodedCountry)}`);
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
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
        {cityData?.images.map((image, index) => (
          <div
            key={image.name}
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
        ))}
      </div>

      {/* Full-size image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div className="relative max-w-4xl max-h-screen p-4">
            <button
              className="absolute top-4 right-4 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center"
              onClick={handleCloseModal}
            >
              ×
            </button>
            <div className="relative w-full h-screen max-h-[80vh]">
              <Image
                src={selectedImage.path}
                alt={selectedImage.name}
                fill
                style={{ objectFit: 'contain' }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}