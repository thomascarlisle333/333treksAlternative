'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TripAdminPage() {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchTrips() {
            try {
                setLoading(true);
                const response = await fetch('/api/trip-routes');

                if (!response.ok) {
                    throw new Error('Failed to fetch trips');
                }

                const data = await response.json();
                setTrips(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching trips:', err);
                setError(err.message);
                setLoading(false);
            }
        }

        fetchTrips();
    }, []);

    const navigateToHome = () => {
        router.push('/');
    };

    const navigateToTrip = () => {
        router.push('/trip');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No date';

        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="text-xl">Loading trip data...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="text-xl text-red-600">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold">Trip Administration</h1>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <button
                            onClick={navigateToHome}
                            className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                            Return Home
                        </button>
                        <button
                            onClick={navigateToTrip}
                            className="px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                            View Trips
                        </button>
                    </div>
                </div>

                <div className="w-24 h-1 bg-gray-800 mb-8 hidden md:block"></div>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold">Manage Trips</h2>
                    <Link
                        href="/trip/admin/edit/new"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                        Create New Trip
                    </Link>
                </div>

                {trips.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-lg mb-4">No trips have been added yet.</p>
                        <p>Click the "Create New Trip" button to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {trips.map(trip => (
                            <div key={trip.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between mb-4">
                                        <h3 className="text-xl font-bold">{trip.name}</h3>
                                        {trip.date && (
                                            <span className="text-gray-500 mt-1 md:mt-0">
                                                {formatDate(trip.date)}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-600 mb-4">{trip.description}</p>

                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex flex-wrap gap-2">
                                            <div className="text-sm bg-gray-100 px-3 py-1 rounded">
                                                {trip.segments?.length || 0} segments
                                            </div>

                                            {trip.segments && Array.from(new Set(trip.segments.map(s => s.transport))).map(transport => (
                                                <div
                                                    key={transport}
                                                    className="text-sm px-3 py-1 rounded flex items-center gap-1"
                                                    style={{ backgroundColor: `${TRANSPORT_COLORS[transport]}20` }}
                                                >
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TRANSPORT_COLORS[transport] }}></span>
                                                    <span>{transport}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-4">
                                        {/* IMPORTANT FIX: Make sure to pass the trip ID as a string */}
                                        <Link
                                            href={`/trip/admin/edit/${String(trip.id)}`}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                        >
                                            Edit Trip
                                        </Link>
                                        <Link
                                            href={`/trip?selected=${trip.id}`}
                                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                                        >
                                            View on Map
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
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

// Transport colors for badges
const TRANSPORT_COLORS = {
    'train': '#3498db',  // blue
    'plane': '#9b59b6',  // purple
    'car': '#e74c3c',    // red
    'bus': '#2ecc71',    // green
    'boat': '#f39c12',   // orange
    'bicycle': '#16a085', // teal
    'walking': '#7f8c8d'  // gray
};