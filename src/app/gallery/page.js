'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
          <p className="text-xl text-gray-800">Loading your amazing photography...</p>
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
        <div className="container mx-auto px-4 py-8 relative">
          {/* Home button in the upper left */}
          <div className="absolute top-4 left-4">
            <Link href="/">
              <button className="mr-4 px-4 py-2 bg-gray-900 hover:bg-gray-600 text-white rounded-lg transition-colors">
                Home
              </button>
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-8 text-center pt-12 text-gray-800">My Travel Photography</h1>

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
                            unoptimized={true} // Add this because we're using external URLs
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-50 text-white p-3">
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
                      className="mr-4 px-4 py-2 bg-gray-900 hover:bg-gray-600 rounded-lg transition-colors text-white"
                  >
                    ← Back to Countries
                  </button>
                  <h2 className="text-2xl font-semibold text-gray-800">{selectedCountry}</h2>
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
                                  unoptimized={true} // Add this because we're using external URLs
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-50 text-white p-3">
                                <h3 className="text-lg font-semibold">{city.name}</h3>
                              </div>
                            </div>
                          </div>
                      ))}
                </div>
              </>
          )}
        </div>

        {/* Footer - Consistent with trip page */}
        <footer className="py-8 px-4 bg-gray-800 text-white rounded-t-lg mt-12">
          <div className="max-w-6xl mx-auto text-center">
            <p>© {new Date().getFullYear()} 333Treks. All rights reserved.</p>
          </div>
        </footer>
      </div>
  );
}