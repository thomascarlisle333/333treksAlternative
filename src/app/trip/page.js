'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Suspense } from 'react';
import 'leaflet/dist/leaflet.css';

// Dynamically import the TripMap component with no SSR
const TripMap = dynamic(() => import('../../components/TripMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100">Loading map...</div>
});

// Transport type to color mapping
const TRANSPORT_COLORS = {
    'train': '#3498db',  // blue
    'plane': '#9b59b6',  // purple
    'car': '#e74c3c',    // red
    'bus': '#2ecc71',    // green
    'boat': '#f39c12',   // orange
    'bicycle': '#16a085', // teal
    'walking': '#7f8c8d'  // gray
};

// Transport icons for visual representation
const transportIcons = {
    "train": "🚆",
    "plane": "✈️",
    "car": "🚗",
    "bus": "🚌",
    "boat": "⛴️",
    "bicycle": "🚲",
    "walking": "🚶"
};

// Function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    // Convert degrees to radians
    const toRad = (value) => value * Math.PI / 180;

    const R = 3958.8; // Earth's radius in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in miles
}

// Component that uses the searchParams but doesn't directly render content
function SearchParamsHelper({ onParamsChange }) {
    const searchParams = useSearchParams();

    useEffect(() => {
        const selectedId = searchParams.get('selected');
        onParamsChange(selectedId ? parseInt(selectedId, 10) : null);
    }, [searchParams, onParamsChange]);

    return null;
}

// Main page component
export default function TripPage() {
    const router = useRouter();
    const [selectedIdFromUrl, setSelectedIdFromUrl] = useState(null);
    const [tripData, setTripData] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [noTripMatched, setNoTripMatched] = useState(false);

    // Filter states
    const [filteredTrips, setFilteredTrips] = useState([]);
    const [regionFilter, setRegionFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');
    const [durationFilter, setDurationFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('date-desc'); // Default sort by date (newest first)

    // Trip statistics state
    const [tripStats, setTripStats] = useState(null);
    const [relatedTrips, setRelatedTrips] = useState([]);

    // Available filter options
    const [availableRegions, setAvailableRegions] = useState([]);
    const [availableYears, setAvailableYears] = useState([]);

    // Handle URL search params changes
    const handleParamsChange = (selectedId) => {
        setSelectedIdFromUrl(selectedId);
    };

    // Apply filters to the trip data
    const applyFilters = (trips, region, year, duration, sort) => {
        let filtered = [...trips];

        // Apply region filter
        if (region !== 'all') {
            filtered = filtered.filter(trip => trip.region === region);
        }

        // Apply year filter
        if (year !== 'all') {
            filtered = filtered.filter(trip => {
                if (!trip.date) return false;
                return trip.date.startsWith(year);
            });
        }

        // Apply duration filter
        if (duration !== 'all') {
            switch (duration) {
                case 'short':
                    filtered = filtered.filter(trip => trip.duration <= 7);
                    break;
                case 'medium':
                    filtered = filtered.filter(trip => trip.duration > 7 && trip.duration <= 14);
                    break;
                case 'long':
                    filtered = filtered.filter(trip => trip.duration > 14);
                    break;
            }
        }

        // Apply sorting
        switch (sort) {
            case 'date-desc':
                filtered = filtered.sort((a, b) => {
                    if (!a.date) return 1;
                    if (!b.date) return -1;
                    return b.date.localeCompare(a.date);
                });
                break;
            case 'date-asc':
                filtered = filtered.sort((a, b) => {
                    if (!a.date) return -1;
                    if (!b.date) return 1;
                    return a.date.localeCompare(b.date);
                });
                break;
            case 'alpha-asc':
                filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'alpha-desc':
                filtered = filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'duration-asc':
                filtered = filtered.sort((a, b) => (a.duration || 0) - (b.duration || 0));
                break;
            case 'duration-desc':
                filtered = filtered.sort((a, b) => (b.duration || 0) - (a.duration || 0));
                break;
        }

        setFilteredTrips(filtered);

        // Handle case when no trips match the filters
        if (filtered.length === 0) {
            setNoTripMatched(true);
            setSelectedTrip(null);
            setTripStats(null);
            setRelatedTrips([]);
        } else {
            setNoTripMatched(false);
            // If currently selected trip doesn't match the filters, select the first one
            if (!selectedTrip || !filtered.some(trip => trip.id === selectedTrip.id)) {
                setSelectedTrip(filtered[0]);
                updateTripStats(filtered[0]);
                findRelatedTrips(filtered[0], tripData);
            }
        }
    };

    // Load trip data
    useEffect(() => {
        const fetchTripData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/trip-routes');

                if (!response.ok) {
                    throw new Error('Failed to fetch trip data');
                }

                const data = await response.json();

                // Sort the data by date descending (newest first) for initial load
                const sortedData = [...data].sort((a, b) => {
                    if (!a.date) return 1;
                    if (!b.date) return -1;
                    return b.date.localeCompare(a.date);
                });

                setTripData(sortedData);

                // Extract all unique regions directly from the trip data
                const regions = [...new Set(sortedData
                    .map(trip => trip.region ? trip.region.trim() : 'Unknown')
                    .filter(region => region && region !== '')
                )].sort();

                setAvailableRegions(regions);

                // Extract years properly, ensuring only valid years are included
                const years = [...new Set(sortedData.map(trip => {
                    if (!trip.date) return 'Unknown';
                    const yearPart = trip.date.split('-')[0];
                    // Only return if it's a valid 4-digit year
                    return /^\d{4}$/.test(yearPart) ? yearPart : 'Unknown';
                }))].filter(year => year !== 'Unknown');

                setAvailableYears(years.sort((a, b) => b - a)); // Sort years descending

                if (sortedData.length > 0) {
                    // Set the first trip as selected by default if data exists
                    setSelectedTrip(sortedData[0]);
                    updateTripStats(sortedData[0]);
                    findRelatedTrips(sortedData[0], sortedData);
                }

                // Apply initial filters with the sorted data
                applyFilters(sortedData, 'all', 'all', 'all', 'date-desc');

                setLoading(false);
            } catch (error) {
                console.error('Error fetching trip data:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchTripData();
    }, []);

    // Handle URL selected trip ID changes
    useEffect(() => {
        if (selectedIdFromUrl && tripData.length > 0) {
            const trip = tripData.find(t => t.id === selectedIdFromUrl);
            if (trip) {
                setSelectedTrip(trip);
                updateTripStats(trip);
                findRelatedTrips(trip, tripData);
            }
        }
    }, [selectedIdFromUrl, tripData]);

    // Calculate statistics for the selected trip
    const updateTripStats = (trip) => {
        if (!trip || !trip.segments || trip.segments.length === 0) {
            setTripStats(null);
            return;
        }

        // Count transport types
        const transportCounts = {};
        const distanceByTransport = {};
        let totalDistance = 0;

        // Get start and end points
        const startPoint = trip.segments[0].from;
        const endPoint = trip.segments[trip.segments.length - 1].to;

        // Calculate statistics for each segment
        trip.segments.forEach(segment => {
            // Count transport types
            transportCounts[segment.transport] = (transportCounts[segment.transport] || 0) + 1;

            // Calculate distance for this segment
            const distance = calculateDistance(
                segment.from.lat,
                segment.from.lng,
                segment.to.lat,
                segment.to.lng
            );

            // Add to distance by transport type
            distanceByTransport[segment.transport] = (distanceByTransport[segment.transport] || 0) + distance;

            // Add to total distance
            totalDistance += distance;
        });

        setTripStats({
            transportCounts,
            distanceByTransport,
            totalDistance: Math.round(totalDistance),
            startPoint,
            endPoint
        });
    };

    // Find related trips based on region or timeframe
    const findRelatedTrips = (currentTrip, allTrips) => {
        if (!currentTrip || allTrips.length <= 1) {
            setRelatedTrips([]);
            return;
        }

        // Find trips in the same region or within 6 months
        const related = allTrips.filter(trip => {
            if (trip.id === currentTrip.id) return false;

            // Same region
            if (trip.region === currentTrip.region) return true;

            // Within 6 months
            if (trip.date && currentTrip.date) {
                const tripDate = new Date(trip.date);
                const currentDate = new Date(currentTrip.date);
                const diff = Math.abs(tripDate - currentDate);
                const diffMonths = diff / (1000 * 60 * 60 * 24 * 30);
                return diffMonths <= 6;
            }

            return false;
        }).slice(0, 3); // Limit to 3 related trips

        setRelatedTrips(related);
    };

    // Handle filter changes
    const handleRegionChange = (e) => {
        const value = e.target.value;
        setRegionFilter(value);
        applyFilters(tripData, value, yearFilter, durationFilter, sortOrder);
    };

    const handleYearChange = (e) => {
        const value = e.target.value;
        setYearFilter(value);
        applyFilters(tripData, regionFilter, value, durationFilter, sortOrder);
    };

    const handleDurationChange = (e) => {
        const value = e.target.value;
        setDurationFilter(value);
        applyFilters(tripData, regionFilter, yearFilter, value, sortOrder);
    };

    const handleSortChange = (e) => {
        const value = e.target.value;
        setSortOrder(value);
        applyFilters(tripData, regionFilter, yearFilter, durationFilter, value);
    };

    const handleTripSelect = (tripId) => {
        const trip = tripData.find(t => t.id === tripId);
        if (trip) {
            setSelectedTrip(trip);
            updateTripStats(trip);
            findRelatedTrips(trip, tripData);
        }
    };

    const navigateToHome = () => {
        router.push('/');
    };

    // Format the date to be more readable
    const formatDate = (dateString) => {
        if (!dateString) return '';

        // Check if we need to add a day to the date
        const parts = dateString.split('-');
        if (parts.length === 2) {
            // Add the first day of the month if only year-month is provided
            dateString = `${dateString}-01`;
        }

        // Create date object and check if it's valid
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return dateString; // Return the original string if invalid
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
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
                <div className="text-xl text-red-600">
                    Error: {error}
                    <p className="mt-4 text-base">
                        Make sure you have the CSV files in the correct location:<br/>
                        <code className="bg-gray-200 px-2 py-1 rounded">data/trips.csv</code> and <code
                        className="bg-gray-200 px-2 py-1 rounded">data/trip_segments.csv</code>
                    </p>
                </div>
            </div>
        );
    }

    if (tripData.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="text-xl text-center max-w-md p-8 bg-white rounded-lg shadow-md">
                    <p className="mb-4">No trips found in the database.</p>
                    <p className="mb-6">Please make sure your CSV files are correctly formatted and located in the data
                        directory.</p>
                    <div className="flex justify-center">
                        <Link
                            href="/trip/admin"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Go to Admin
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            {/* Wrap ONLY the component that uses useSearchParams in Suspense */}
            <Suspense fallback={null}>
                <SearchParamsHelper onParamsChange={handleParamsChange} />
            </Suspense>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">My Travel Journeys</h1>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <button
                            onClick={navigateToHome}
                            className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                            Return Home
                        </button>
                        <button
                            onClick={() => router.push('/trip/login')}
                            className="px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                            Admin Panel
                        </button>
                    </div>
                </div>

                <div className="w-24 h-1 bg-gray-800 mb-8 hidden md:block"></div>

                <p className="text-lg leading-relaxed mb-8 max-w-3xl text-gray-800">
                    Follow my journey across different destinations, with various modes of transportation highlighted by
                    different colored lines.
                    Each trip tells a unique story of exploration and adventure.
                </p>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Filter Trips</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Region Filter */}
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regionFilter">
                                Region
                            </label>
                            <select
                                id="regionFilter"
                                value={regionFilter}
                                onChange={handleRegionChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Regions</option>
                                {availableRegions.map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                        </div>

                        {/* Year Filter */}
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="yearFilter">
                                Year
                            </label>
                            <select
                                id="yearFilter"
                                value={yearFilter}
                                onChange={handleYearChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Years</option>
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* Duration Filter */}
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="durationFilter">
                                Duration
                            </label>
                            <select
                                id="durationFilter"
                                value={durationFilter}
                                onChange={handleDurationChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Durations</option>
                                <option value="short">Short (≤ 7 days)</option>
                                <option value="medium">Medium (8-14 days)</option>
                                <option value="long">Long (&gt; 14 days)</option>
                            </select>
                        </div>

                        {/* Sort Order */}
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sortOrder">
                                Sort By
                            </label>
                            <select
                                id="sortOrder"
                                value={sortOrder}
                                onChange={handleSortChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="date-desc">Date (Newest First)</option>
                                <option value="date-asc">Date (Oldest First)</option>
                                <option value="alpha-asc">Name (A-Z)</option>
                                <option value="alpha-desc">Name (Z-A)</option>
                                <option value="duration-desc">Duration (Longest First)</option>
                                <option value="duration-asc">Duration (Shortest First)</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter results count */}
                    <div className="mt-4 text-gray-600">
                        Showing {filteredTrips.length} of {tripData.length} trips
                    </div>
                </div>

                {/* No trips matched message */}
                {noTripMatched && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8 text-center">
                        <h3 className="text-xl font-semibold mb-2">No trips match your filters</h3>
                        <p className="mb-4">Try adjusting your filter criteria to see available trips.</p>
                        <button
                            onClick={() => {
                                setRegionFilter('all');
                                setYearFilter('all');
                                setDurationFilter('all');
                                applyFilters(tripData, 'all', 'all', 'all', sortOrder);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                )}

                {/* Trip selector */}
                {!noTripMatched && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Select a Trip:</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTrips.map(trip => (
                                <div
                                    key={trip.id}
                                    onClick={() => handleTripSelect(trip.id)}
                                    className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                        selectedTrip?.id === trip.id
                                            ? 'bg-gray-800 text-white'
                                            : 'bg-white hover:bg-gray-100'
                                    }`}
                                >
                                    <h3 className="font-bold text-lg">{trip.name}</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {trip.date && (
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                selectedTrip?.id === trip.id ? 'bg-gray-700' : 'bg-gray-200'
                                            }`}>
                          {formatDate(trip.date)}
                        </span>
                                        )}
                                        {trip.region && (
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                selectedTrip?.id === trip.id ? 'bg-gray-700' : 'bg-gray-200'
                                            }`}>
                          {trip.region}
                        </span>
                                        )}
                                        {trip.duration && (
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                selectedTrip?.id === trip.id ? 'bg-gray-700' : 'bg-gray-200'
                                            }`}>
                          {trip.duration} days
                        </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedTrip && (
                    <>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold">{selectedTrip.name}</h2>
                            <div className="flex flex-wrap items-center gap-4 mt-2">
                                <p className="text-gray-600">{selectedTrip.description}</p>
                                {selectedTrip.date && (
                                    <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                    {formatDate(selectedTrip.date)}
                  </span>
                                )}
                                {selectedTrip.region && (
                                    <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                    {selectedTrip.region}
                  </span>
                                )}
                                {selectedTrip.duration && (
                                    <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                    {selectedTrip.duration} days
                  </span>
                                )}
                            </div>
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
                            <TripMap trip={selectedTrip}/>
                        </div>

                        {/* Trip details */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h3 className="text-xl font-semibold mb-4">Journey Details</h3>
                            <div className="space-y-4">
                                {selectedTrip.segments.map((segment, index) => (
                                    <div key={index} className="border-l-4 pl-4" style={{borderColor: segment.color}}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{transportIcons[segment.transport] || ''}</span>
                                            <h4 className="font-medium text-gray-600">{segment.from.name} to {segment.to.name}</h4>
                                        </div>
                                        <p className="text-gray-600 mt-1">{segment.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trip Statistics */}
                        {tripStats && (
                            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                                <h3 className="text-xl font-semibold mb-4 text-gray-800">Trip Statistics</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Journey Information */}
                                    <div>
                                        <h4 className="font-medium text-lg mb-2 text-gray-800">Journey Information</h4>
                                        <div className="space-y-3">
                                            <p><span
                                                className="font-semibold text-gray-800">Start Point:</span> {tripStats.startPoint.name}
                                            </p>
                                            <p><span
                                                className="font-semibold text-gray-800">End Point:</span> {tripStats.endPoint.name}
                                            </p>
                                            <p><span
                                                className="font-semibold text-gray-800">Total Distance:</span> {tripStats.totalDistance.toLocaleString()} miles
                                            </p>
                                        </div>
                                    </div>

                                    {/* Transport Statistics */}
                                    <div>
                                        <h4 className="font-medium text-lg mb-2 text-gray-800">Transportation Breakdown</h4>
                                        <div className="space-y-3">
                                            {Object.entries(tripStats.transportCounts).map(([transport, count]) => (
                                                <div key={transport} className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <span
                                                            className="text-xl mr-2 text-gray-800">{transportIcons[transport] || ''}</span>
                                                        <span className="capitalize">{transport}:</span>
                                                    </div>
                                                    <div>
                                                        <span
                                                            className="font-semibold text-gray-800">{count} segment{count !== 1 ? 's' : ''}</span>
                                                        <span className="text-gray-500 ml-2">
                                                            ({Math.round(tripStats.distanceByTransport[transport]).toLocaleString()} miles)
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Related Trips */}
                        {relatedTrips.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                                <h3 className="text-xl font-semibold mb-4">Related Trips</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {relatedTrips.map(trip => (
                                        <div
                                            key={trip.id}
                                            onClick={() => handleTripSelect(trip.id)}
                                            className="p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all"
                                        >
                                            <h4 className="font-medium">{trip.name}</h4>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {trip.date && (
                                                    <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                                                        {formatDate(trip.date)}
                                                    </span>
                                                )}
                                                {trip.region && (
                                                    <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                                                        {trip.region}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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