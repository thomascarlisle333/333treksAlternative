'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import React from 'react';

// DEFINITIVE COLOR MAPPING - These must match TripMap.js exactly
const COLORS = {
    PLANE: "#9b59b6", // Purple for planes
    TRAIN: "#3498db", // Blue for trains
    CAR: "#e74c3c",   // Red for cars
    BUS: "#2ecc71",   // Green for buses
    BOAT: "#1abc9c",  // Teal for boats
    DEFAULT: "#000000" // Black for unknown transport types
};

// Transport type to icon mapping (using emoji for simplicity)
const TRANSPORT_ICONS = {
    "plane": "✈️",
    "train": "🚆",
    "car": "🚗",
    "bus": "🚌",
    "boat": "⛴️",
    "bicycle": "🚲",
    "walking": "🚶"
};

// Use this function to get colors consistently
function getColorForTransport(transportType) {
    switch (transportType.toLowerCase()) {
        case 'plane':
            return COLORS.PLANE;
        case 'train':
            return COLORS.TRAIN;
        case 'car':
            return COLORS.CAR;
        case 'bus':
            return COLORS.BUS;
        case 'boat':
            return COLORS.BOAT;
        default:
            return COLORS.DEFAULT;
    }
}

// Import these components dynamically with no SSR to avoid hydration issues
const MapWithNoSSR = dynamic(
    () => import('../../components/TripMap'),
    { ssr: false }
);

export default function TripPage() {
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [trips, setTrips] = useState([]);
    const [filteredTrips, setFilteredTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [regions, setRegions] = useState([]);
    const [years, setYears] = useState([]);

    // Filter states
    const [selectedRegion, setSelectedRegion] = useState('All');
    const [selectedYear, setSelectedYear] = useState('All');
    const [durationFilter, setDurationFilter] = useState('All');
    const [sortBy, setSortBy] = useState('date-desc'); // Default sort by date (newest first)

    const router = useRouter();

    useEffect(() => {
        // Fetch trip data from our API endpoint
        const fetchTrips = async () => {
            try {
                const response = await fetch('/api/trips');
                if (!response.ok) throw new Error('Failed to fetch trips');
                const data = await response.json();

                // No longer need to modify colors here since we'll use getColorForTransport
                // instead of relying on colors from the API
                setTrips(data);

                // Extract unique regions and years for filters
                const uniqueRegions = [...new Set(data.map(trip => trip.region))];
                setRegions(uniqueRegions);

                const uniqueYears = [...new Set(data.map(trip => trip.date.substring(0, 4)))];
                setYears(uniqueYears.sort().reverse()); // Sort years in descending order

                // Initialize with all trips
                setFilteredTrips(data);
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

    // Apply filters when filter criteria change
    useEffect(() => {
        if (trips.length === 0) return;

        let result = [...trips];

        // Apply region filter
        if (selectedRegion !== 'All') {
            result = result.filter(trip => trip.region === selectedRegion);
        }

        // Apply year filter
        if (selectedYear !== 'All') {
            result = result.filter(trip => trip.date.startsWith(selectedYear));
        }

        // Apply duration filter
        if (durationFilter !== 'All') {
            switch(durationFilter) {
                case 'short':
                    result = result.filter(trip => trip.duration <= 7);
                    break;
                case 'medium':
                    result = result.filter(trip => trip.duration > 7 && trip.duration <= 14);
                    break;
                case 'long':
                    result = result.filter(trip => trip.duration > 14);
                    break;
            }
        }

        // Apply sorting
        result = sortTrips(result, sortBy);

        setFilteredTrips(result);

        // If we have filtered results and the current selection is not in the filtered results,
        // update the selected trip to the first item in the filtered list
        if (result.length > 0 && (!selectedTrip || !result.some(trip => trip.id === selectedTrip.id))) {
            setSelectedTrip(result[0]);
        }
    }, [selectedRegion, selectedYear, durationFilter, sortBy, trips]);

    const sortTrips = (tripsToSort, sortCriteria) => {
        const sortedTrips = [...tripsToSort];

        switch (sortCriteria) {
            case 'date-asc':
                sortedTrips.sort((a, b) => a.date.localeCompare(b.date));
                break;
            case 'date-desc':
                sortedTrips.sort((a, b) => b.date.localeCompare(a.date));
                break;
            case 'duration-asc':
                sortedTrips.sort((a, b) => a.duration - b.duration);
                break;
            case 'duration-desc':
                sortedTrips.sort((a, b) => b.duration - a.duration);
                break;
            case 'name-asc':
                sortedTrips.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sortedTrips.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }

        return sortedTrips;
    };

    const navigateToHome = () => {
        router.push('/');
    };

    const handleTripSelect = (tripId) => {
        const trip = trips.find(t => t.id === tripId);
        if (trip) {
            setSelectedTrip(trip);
        }
    };

    const resetFilters = () => {
        setSelectedRegion('All');
        setSelectedYear('All');
        setDurationFilter('All');
        setSortBy('date-desc');
    };

    // Function to format date from YYYY-MM to Month Year
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month] = dateString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    };

    // Render filter components
    const renderFilters = () => {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Filter & Sort</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Region Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                        <select
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            <option value="All">All Regions</option>
                            {regions.map(region => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                    </div>

                    {/* Year Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            <option value="All">All Years</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    {/* Duration Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                        <select
                            value={durationFilter}
                            onChange={(e) => setDurationFilter(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            <option value="All">All Durations</option>
                            <option value="short">Short (≤ 7 days)</option>
                            <option value="medium">Medium (8-14 days)</option>
                            <option value="long">Long ({'>'}14 days)</option>
                        </select>
                    </div>

                    {/* Sort By */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            <option value="date-desc">Date (Newest First)</option>
                            <option value="date-asc">Date (Oldest First)</option>
                            <option value="duration-desc">Duration (Longest First)</option>
                            <option value="duration-asc">Duration (Shortest First)</option>
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                        </select>
                    </div>
                </div>

                {/* Filter Reset Button */}
                <div className="mt-4 text-right">
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:underline"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>
        );
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

    // No trips found after filtering
    if (filteredTrips.length === 0) {
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

                    <div className="mb-8">
                        {renderFilters()}
                    </div>

                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold mb-4">No trips found with the selected filters</h2>
                        <p className="text-gray-600 mb-6">Try adjusting your filters to see more trips.</p>
                        <button
                            onClick={resetFilters}
                            className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                            Reset All Filters
                        </button>
                    </div>
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

                {/* Filter Section */}
                {renderFilters()}

                {/* Trip selector */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Select a Trip:</h2>
                    <div className="flex flex-wrap gap-4">
                        {filteredTrips.map(trip => (
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
                            <div className="flex flex-col md:flex-row justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold">{selectedTrip.name}</h2>
                                    <p className="text-gray-600 mt-2">{selectedTrip.description}</p>
                                </div>
                                <div className="mt-4 md:mt-0 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>{formatDate(selectedTrip.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{selectedTrip.region}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{selectedTrip.duration} days</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* UPDATED Legend with new color function */}
                        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                            <h3 className="font-semibold mb-2">Transportation Methods:</h3>
                            <div className="flex flex-wrap gap-4">
                                {Array.from(new Set(selectedTrip.segments.map(s => s.transport))).map(transport => (
                                    <div key={transport} className="flex items-center">
                                        <div
                                            className="w-6 h-2 mr-2"
                                            style={{ backgroundColor: getColorForTransport(transport) }}
                                        ></div>
                                        <span>
                                            {TRANSPORT_ICONS[transport.toLowerCase()] || ''} {transport.charAt(0).toUpperCase() + transport.slice(1)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Map */}
                        <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg mb-8">
                            <MapWithNoSSR selectedTrip={selectedTrip} />
                        </div>

                        {/* UPDATED Trip details with new color function */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h3 className="text-xl font-semibold mb-4">Journey Details</h3>
                            <div className="space-y-4">
                                {selectedTrip.segments.map((segment, index) => (
                                    <div key={index}
                                         className="border-l-4 pl-4"
                                         style={{ borderColor: getColorForTransport(segment.transport) }}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{TRANSPORT_ICONS[segment.transport.toLowerCase()] || ''}</span>
                                            <h4 className="font-medium">{segment.from.name} to {segment.to.name}</h4>
                                        </div>
                                        <p className="text-gray-600 mt-1">{segment.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* Trip Stats Section */}
                {selectedTrip && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* UPDATED Transportation Breakdown with new color function */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="font-semibold mb-3 text-lg">Transportation Breakdown</h3>
                            <div className="space-y-3">
                                {Object.entries(
                                    selectedTrip.segments.reduce((acc, segment) => {
                                        acc[segment.transport] = (acc[segment.transport] || 0) + 1;
                                        return acc;
                                    }, {})
                                ).sort((a, b) => b[1] - a[1]).map(([transport, count]) => (
                                    <div key={transport} className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <span className="mr-2">{TRANSPORT_ICONS[transport.toLowerCase()] || ''}</span>
                                            <span>{transport.charAt(0).toUpperCase() + transport.slice(1)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="h-2.5 rounded-full"
                                                    style={{
                                                        width: `${(count / selectedTrip.segments.length) * 100}%`,
                                                        backgroundColor: getColorForTransport(transport)
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-gray-600">{count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="font-semibold mb-3 text-lg">Trip Highlights</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Total destinations: {selectedTrip.segments.length + 1}</li>
                                <li>Starting point: {selectedTrip.segments[0].from.name}</li>
                                <li>Final destination: {selectedTrip.segments[selectedTrip.segments.length - 1].to.name}</li>
                                <li>Trip duration: {selectedTrip.duration} days</li>
                                <li>Trip date: {formatDate(selectedTrip.date)}</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="font-semibold mb-3 text-lg">Related Trips</h3>
                            {filteredTrips.filter(trip =>
                                trip.id !== selectedTrip.id && trip.region === selectedTrip.region
                            ).slice(0, 3).length > 0 ? (
                                <div className="space-y-3">
                                    {filteredTrips.filter(trip =>
                                        trip.id !== selectedTrip.id && trip.region === selectedTrip.region
                                    ).slice(0, 3).map(trip => (
                                        <button
                                            key={trip.id}
                                            onClick={() => handleTripSelect(trip.id)}
                                            className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="font-medium">{trip.name}</div>
                                            <div className="text-sm text-gray-600">{formatDate(trip.date)} • {trip.duration} days</div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600 italic">No related trips in this region.</p>
                            )}
                        </div>
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