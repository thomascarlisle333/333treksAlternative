'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CityGalleryPage() {
  const params = useParams();
  const { country, city } = params;

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setImages(data.images || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    if (country && city) {
      fetchCityImages();
    }
  }, [country, city]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-xl">Loading images from {city}...</p>
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
        {/* Navigation buttons in the upper left */}
        <div className="absolute top-4 left-4 flex">
          <Link href="/">
            <button className="mr-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
              Home
            </button>
          </Link>
          <Link href="/gallery">
            <button className="mr-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors">
              Gallery
            </button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2 text-center pt-12">{city}</h1>
        <h2 className="text-xl mb-8 text-center text-gray-600">{country}</h2>

        {/* Image grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((image) => (
              <div key={image.name} className="transform transition-transform hover:scale-105">
                <div className="relative h-64 rounded-lg overflow-hidden shadow-lg">
                  <Image
                      src={image.url}
                      alt={`${city} - ${image.name}`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      unoptimized={true}
                  />
                </div>
              </div>
          ))}
        </div>

        {images.length === 0 && (
            <div className="text-center py-10">
              <p className="text-xl">No images found for this location.</p>
            </div>
        )}
      </div>
  );
}