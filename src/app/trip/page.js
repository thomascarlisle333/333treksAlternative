'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import React from 'react';

// Import these components dynamically with no SSR to avoid hydration issues
const MapWithNoSSR = dynamic(
    () => import('../../components/TripMap'),
    { ssr: false }
);

export default function TripPage() {
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Fetch trip data from our API endpoint
        const fetchTrips = async () => {
            try {
                const response = await fetch('/api/trips');
                if (!response.ok) throw new Error('Failed to fetch trips');
                const data = await response.json();
                setTrips(data);
                if (data.length > 0) {
                    setSelectedTrip(data[0]);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching trips:', error);
                setLoading(false);
            }
        };

        fetchTrips();
    }, []);

    const navigateToHome = () => {
        router.push('/');
    };

    const handleTripSelect = (tripId) => {
        const trip = trips.find(t => t.id === tripId);
        if (trip) {
            setSelectedTrip(trip);
        }
    };

    // Transport type to icon mapping (using emoji for simplicity)
    const transportIcons = {
        "train": "🚆",
        "plane": "✈️",
        "car": "🚗",
        "bus": "🚌",
        "boat": "⛴️",
        "bicycle": "🚲",
        "walking": "🚶"
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Loading trips...</h1>
                    <div className="w-16 h-16 border-4 border-gray-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold">My Travel Journeys</h1>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <button
                            onClick={navigateToHome}
                            className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                            Return Home
                        </button>
                    </div>
                </div>

                <div className="w-24 h-1 bg-gray-800 mb-8 hidden md:block"></div>

                <p className="text-lg leading-relaxed mb-8 max-w-3xl">
                    Follow my journey across different destinations, with various modes of transportation highlighted by different colored lines.
                    Each trip tells a unique story of exploration and adventure.
                </p>

                {/* Trip selector */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Select a Trip:</h2>
                    <div className="flex flex-wrap gap-4">
                        {trips.map(trip => (
                            <button
                                key={trip.id}
                                onClick={() => handleTripSelect(trip.id)}
                                className={`px-4 py-2 rounded-lg transition-all ${
                                    selectedTrip?.id === trip.id
                                        ? 'bg-gray-800 text-white font-medium shadow-md'
                                        : 'bg-white border border-gray-300 hover:bg-gray-100'
                                }`}
                            >
                                {trip.name}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedTrip && (
                    <>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold">{selectedTrip.name}</h2>
                            <p className="text-gray-600 mt-2">{selectedTrip.description}</p>
                        </div>

                        {/* Legend */}
                        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                            <h3 className="font-semibold mb-2">Transportation Methods:</h3>
                            <div className="flex flex-wrap gap-4">
                                {Array.from(new Set(selectedTrip.segments.map(s => s.transport))).map(transport => (
                                    <div key={transport} className="flex items-center">
                                        <div
                                            className="w-6 h-2 mr-2"
                                            style={{
                                                backgroundColor: selectedTrip.segments.find(s => s.transport === transport).color
                                            }}
                                        ></div>
                                        <span>
                                            {transportIcons[transport] || ''} {transport.charAt(0).toUpperCase() + transport.slice(1)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Map */}
                        <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg mb-8">
                            <MapWithNoSSR selectedTrip={selectedTrip} />
                        </div>

                        {/* Trip details */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h3 className="text-xl font-semibold mb-4">Journey Details</h3>
                            <div className="space-y-4">
                                {selectedTrip.segments.map((segment, index) => (
                                    <div key={index} className="border-l-4 pl-4" style={{ borderColor: segment.color }}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{transportIcons[segment.transport] || ''}</span>
                                            <h4 className="font-medium">{segment.from.name} to {segment.to.name}</h4>
                                        </div>
                                        <p className="text-gray-600 mt-1">{segment.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
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