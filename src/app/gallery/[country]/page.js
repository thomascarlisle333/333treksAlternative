'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CountryPage({ params }) {
  const router = useRouter();

  const [countryData, setCountryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get country from URL params
  const { country } = params;
  const decodedCountry = decodeURIComponent(country);

  useEffect(() => {
    if (!decodedCountry) {
      setError('Country parameter is required');
      setLoading(false);
      return;
    }

    async function fetchCountryData() {
      try {
        const response = await fetch('/api/gallery');
        if (!response.ok) {
          throw new Error('Failed to fetch gallery data');
        }

        const data = await response.json();
        const foundCountry = data.find(c => c.name === decodedCountry);

        if (!foundCountry) {
          throw new Error(`Country "${decodedCountry}" not found`);
        }

        setCountryData(foundCountry);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchCountryData();
  }, [decodedCountry]);

  const handleCityClick = (city) => {
    router.push(`/gallery/${encodeURIComponent(decodedCountry)}/${encodeURIComponent(city.name)}`);
  };

  const handleBackClick = () => {
    router.push('/gallery');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading {decodedCountry} data...</p>
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
          className="mr-4 px-4 py-2 bg-gray-900 hover:bg-gray-300 rounded-lg transition-colors text-gray-800"
        >
          ← Back to Gallery
        </button>
        <h1 className="text-2xl font-bold">
          {decodedCountry}
        </h1>
      </div>

      {/* Cities grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {countryData?.cities.map((city) => (
          <div
            key={city.name}
            className="cursor-pointer transform transition-transform hover:scale-105"
            onClick={() => handleCityClick(city)}
          >
            <div className="relative h-64 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={city.path}
                alt={`${city.name} photography`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-50 text-white p-3">
                <h2 className="text-lg font-semibold">{city.name}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}