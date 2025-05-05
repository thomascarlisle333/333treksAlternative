'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

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
    const router = useRouter();

    const navigateToGallery = () => {
        router.push('/gallery');
    };

    const navigateToHome = () => {
        router.push('/');
    };

    useEffect(() => {
        async function loadPhotoData() {
            try {
                // Fetch the photo data from our API endpoint
                const response = await fetch('/api/photo-locations');
                if (!response.ok) {
                    throw new Error('Failed to fetch photo locations');
                }
                const data = await response.json();
                setPhotoLocations(data);
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

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl text-red-600">Error: {error}</div>
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

                {/* Map component dynamically loaded with no SSR */}
                <MapWithNoSSR locations={photoLocations} />

                <div className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">All Destinations</h2>
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
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>

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