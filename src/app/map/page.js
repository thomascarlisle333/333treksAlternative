'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Cache constants - simple client-side caching
const CACHE_KEY = 'photo_locations_cache';
const CACHE_TIMESTAMP_KEY = 'photo_locations_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in milliseconds

// Dynamically import Leaflet components with no SSR
const MapWithNoSSR = dynamic(
    () => import('./components/MapComponent'),
    {
        ssr: false,
        loading: () => <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg flex items-center justify-center bg-gray-100">
            <p className="text-xl">Loading map...</p>
        </div>
    }
);

export default function MapPage() {
    const [photoLocations, setPhotoLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debugMode, setDebugMode] = useState(false);
    const router = useRouter();

    const navigateToGallery = () => {
        router.push('/gallery');
    };

    const navigateToHome = () => {
        router.push('/');
    };

    const clearCache = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(CACHE_TIMESTAMP_KEY);
            console.log('Cache cleared');
            window.location.reload();
        }
    };

    const toggleDebug = () => {
        setDebugMode(prev => !prev);
    };

    useEffect(() => {
        async function loadPhotoData() {
            console.log("Starting to load photo data");

            // Check if we're in the browser
            if (typeof window === 'undefined') {
                console.log("Server-side rendering, skipping data load");
                return;
            }

            try {
                // Try to load from localStorage first for faster loads
                console.log("Checking localStorage cache");
                const cachedData = localStorage.getItem(CACHE_KEY);
                const cachedTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

                // Check if cache is valid (not expired)
                if (cachedData && cachedTimestamp) {
                    const timestamp = parseInt(cachedTimestamp, 10);
                    const now = Date.now();

                    if (!isNaN(timestamp) && (now - timestamp) < CACHE_DURATION) {
                        console.log('Loading map data from localStorage cache');
                        try {
                            const parsedData = JSON.parse(cachedData);
                            if (Array.isArray(parsedData) && parsedData.length > 0) {
                                setPhotoLocations(parsedData);
                                setLoading(false);
                                return;
                            }
                        } catch (parseError) {
                            console.error("Error parsing cached data:", parseError);
                        }
                    }
                }

                // If no valid cache exists, fetch from API
                console.log('Fetching map data from API');
                const response = await fetch('/api/photo-locations');

                if (!response.ok) {
                    throw new Error(`Failed to fetch photo locations: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log(`API returned ${data?.length || 0} locations`);

                if (Array.isArray(data) && data.length > 0) {
                    setPhotoLocations(data);

                    // Save to localStorage for faster loads next time
                    try {
                        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                        localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
                        console.log(`Saved ${data.length} locations to localStorage cache`);
                    } catch (storageError) {
                        console.error('Error saving to localStorage:', storageError);
                    }
                } else {
                    throw new Error("API returned invalid or empty data");
                }
            } catch (err) {
                console.error('Error loading photo locations:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadPhotoData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading map data...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Explore My Travel Locations</h1>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <button
                            onClick={navigateToHome}
                            className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                            Return Home
                        </button>
                        <button
                            onClick={navigateToGallery}
                            className="px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                            Browse Gallery
                        </button>
                    </div>
                </div>

                <div className="w-24 h-1 bg-gray-800 mb-8 hidden md:block"></div>

                <p className="text-lg leading-relaxed mb-8 max-w-3xl text-gray-800">
                    Each pin represents a location I&apos;ve captured through my lens. Click on any marker to see details
                    and access photos from that destination. This interactive map lets you explore my photographic journey around the world.
                </p>

                {error && (
                    <div className="mb-8 p-4 bg-red-100 text-red-800 rounded-lg">
                        <h2 className="font-bold text-lg mb-2">Error Loading Map Data</h2>
                        <p>{error}</p>
                        <div className="mt-4 flex space-x-4">
                            <button
                                onClick={clearCache}
                                className="px-4 py-2 bg-red-700 text-white rounded"
                            >
                                Clear Cache and Reload
                            </button>
                            <button
                                onClick={toggleDebug}
                                className="px-4 py-2 bg-gray-700 text-white rounded"
                            >
                                {debugMode ? "Hide Debug Info" : "Show Debug Info"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Map component dynamically loaded with no SSR */}
                {photoLocations.length > 0 ? (
                    <MapWithNoSSR locations={photoLocations} />
                ) : (
                    <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg mb-8 flex items-center justify-center bg-gray-100">
                        <p className="text-xl">No location data available. Please try reloading.</p>
                    </div>
                )}

                {/* Debug Info */}
                {debugMode && (
                    <div className="mb-8 p-4 bg-gray-100 rounded-lg overflow-auto">
                        <h2 className="font-bold text-lg mb-2">Debug Info</h2>
                        <div className="mb-4">
                            <h3 className="font-bold">Photo Locations:</h3>
                            <p>Count: {photoLocations.length}</p>
                            {photoLocations.length > 0 && (
                                <div>
                                    <p>First location:</p>
                                    <pre className="bg-gray-200 p-2 rounded overflow-auto">
                                        {JSON.stringify(photoLocations[0], null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                        <div className="mb-4">
                            <button
                                onClick={clearCache}
                                className="px-4 py-2 bg-red-700 text-white rounded mr-2"
                            >
                                Clear Cache and Reload
                            </button>
                            <button
                                onClick={toggleDebug}
                                className="px-4 py-2 bg-gray-700 text-white rounded"
                            >
                                Hide Debug Info
                            </button>
                        </div>
                    </div>
                )}

                <div className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">All Destinations ({photoLocations.length})</h2>
                    <div className="w-24 h-1 bg-gray-800 mx-auto mb-8"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {photoLocations.map((location, index) => (
                            <Link
                                key={index}
                                href={`/gallery/${encodeURIComponent(location.country)}/${encodeURIComponent(location.city)}`}
                                className="block p-6 border rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 transform bg-white"
                            >
                                <h2 className="text-xl font-semibold mb-2 text-gray-800">{location.city}, {location.country}</h2>
                                <div className="w-12 h-0.5 bg-gray-300 mb-3"></div>
                                <p className="text-gray-600">{location.photoCount} photos</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                    {location.isDefaultLocation && <span className="ml-2 text-yellow-600">(Default)</span>}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>

                {!debugMode && (
                    <div className="mb-4 flex justify-center">
                        <button
                            onClick={toggleDebug}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        >
                            Show Debug Info
                        </button>
                    </div>
                )}

                {/* Footer */}
                <footer className="py-8 px-4 bg-gray-800 text-white rounded-t-lg mt-12">
                    <div className="max-w-6xl mx-auto text-center">
                        <p>© {new Date().getFullYear()} 333Treks. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}