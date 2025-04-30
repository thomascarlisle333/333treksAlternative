'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function GalleryPage() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await fetch('/api/gallery');
        if (!response.ok) {
          throw new Error('Failed to fetch gallery data');
        }
        const data = await response.json();
        setCountries(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchCountries();
  }, []);

  const handleCountryClick = (country) => {
    if (selectedCountry === country.name) {
      // If the same country is clicked again, reset selection
      setSelectedCountry(null);
    } else {
      setSelectedCountry(country.name);
    }
  };

  const handleCityClick = (country, city) => {
    // Navigate to the city page with dynamic route parameters
    router.push(`/gallery/${encodeURIComponent(country)}/${encodeURIComponent(city.name)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading your amazing photography...</p>
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
      <h1 className="text-3xl font-bold mb-8 text-center">My Travel Photography</h1>

      {/* Display countries grid */}
      {!selectedCountry && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {countries.map((country) => (
            <div
              key={country.name}
              className="cursor-pointer transform transition-transform hover:scale-105"
              onClick={() => handleCountryClick(country)}
            >
              <div className="relative h-64 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={country.path}
                  alt={`${country.name} photography`}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                  <h2 className="text-xl font-semibold">{country.name}</h2>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Display cities for selected country */}
      {selectedCountry && (
        <>
          <div className="mb-6 flex items-center">
            <button
              onClick={() => setSelectedCountry(null)}
              className="mr-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              ← Back to Countries
            </button>
            <h2 className="text-2xl font-semibold">{selectedCountry}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {countries
              .find(country => country.name === selectedCountry)
              ?.cities.map((city) => (
                <div
                  key={city.name}
                  className="cursor-pointer transform transition-transform hover:scale-105"
                  onClick={() => handleCityClick(selectedCountry, city)}
                >
                  <div className="relative h-64 rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src={city.path}
                      alt={`${city.name} photography`}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                      <h3 className="text-lg font-semibold">{city.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}