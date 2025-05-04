'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';

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

// Transport options for dropdown
const TRANSPORT_OPTIONS = [
    { value: 'train', label: '🚆 Train' },
    { value: 'plane', label: '✈️ Plane' },
    { value: 'car', label: '🚗 Car' },
    { value: 'bus', label: '🚌 Bus' },
    { value: 'boat', label: '⛴️ Boat' },
    { value: 'bicycle', label: '🚲 Bicycle' },
    { value: 'walking', label: '🚶 Walking' }
];

// Region options for dropdown
const REGION_OPTIONS = [
    { value: 'Asia', label: 'Asia' },
    { value: 'Europe', label: 'Europe' },
    { value: 'North America', label: 'North America' },
    { value: 'South America', label: 'South America' },
    { value: 'Africa', label: 'Africa' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Antarctica', label: 'Antarctica' },
    { value: 'Pacific', label: 'Pacific' },
    { value: 'Other', label: 'Other' }
];

export default function TripEditor({ params }) {
    const router = useRouter();

    // Use React.use() to properly access params
    const resolvedParams = params ? use(params) : {};
    const tripId = resolvedParams.tripId;

    const isNewTrip = tripId === 'new';

    // Debug parameter issue
    console.log("Current tripId parameter:", tripId, "Type:", typeof tripId);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [allTrips, setAllTrips] = useState([]);

    // Form state
    const [tripData, setTripData] = useState({
        name: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        region: '',
        duration: ''
    });

    // Initialize with a default empty segment for new trips
    const [segments, setSegments] = useState([]);

    // Fetch trip data if editing
    useEffect(() => {
        async function fetchTripData() {
            if (isNewTrip) {
                // Initialize with one empty segment for new trips
                setSegments([{
                    from: { name: '', lat: '', lng: '' },
                    to: { name: '', lat: '', lng: '' },
                    transport: 'car',
                    description: ''
                }]);
                setLoading(false);
                return;
            }

            // Validate tripId
            if (!tripId) {
                console.error("Trip ID is missing or undefined");
                setError("Trip ID is missing. Please go back and try again.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/trip-routes');

                if (!response.ok) {
                    throw new Error('Failed to fetch trip data');
                }

                const trips = await response.json();
                setAllTrips(trips);

                // Debug - Log all trips and the ID we're looking for
                console.log('Available Trips:', trips.map(t => ({
                    id: t.id,
                    idType: typeof t.id,
                    name: t.name
                })));
                console.log('Looking for ID:', tripId, 'Type:', typeof tripId);

                // Try different methods to find the trip due to potential type mismatch
                let trip;
                const parsedTripId = parseInt(tripId, 10);

                // First try direct comparison
                trip = trips.find(t => t.id === parsedTripId);

                // If not found, try string comparison
                if (!trip) {
                    trip = trips.find(t => String(t.id) === String(tripId));
                }

                if (!trip) {
                    console.error(`Trip not found. ID: ${tripId}`);
                    throw new Error(`Trip not found with ID: ${tripId}. Available IDs: ${trips.map(t => t.id).join(', ')}`);
                }

                console.log('Found trip:', trip);

                // Extract date format for compatibility
                let formattedDate = trip.date;
                if (formattedDate && formattedDate.split('-').length === 2) {
                    formattedDate = `${formattedDate}-01`;
                } else if (!formattedDate) {
                    formattedDate = new Date().toISOString().split('T')[0];
                }

                setTripData({
                    name: trip.name || '',
                    description: trip.description || '',
                    date: formattedDate,
                    region: trip.region || '',
                    duration: trip.duration || ''
                });

                // Ensure segments have the correct structure
                if (trip.segments && trip.segments.length > 0) {
                    // Make sure each segment has all required properties
                    const validatedSegments = trip.segments.map(segment => ({
                        from: {
                            name: segment.from?.name || '',
                            lat: segment.from?.lat || 0,
                            lng: segment.from?.lng || 0
                        },
                        to: {
                            name: segment.to?.name || '',
                            lat: segment.to?.lat || 0,
                            lng: segment.to?.lng || 0
                        },
                        transport: segment.transport || 'car',
                        description: segment.description || '',
                        color: segment.color || TRANSPORT_COLORS[segment.transport || 'car']
                    }));
                    setSegments(validatedSegments);
                } else {
                    // Add a default empty segment if no segments exist
                    setSegments([{
                        from: { name: '', lat: '', lng: '' },
                        to: { name: '', lat: '', lng: '' },
                        transport: 'car',
                        description: ''
                    }]);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching trip data:', err);
                setError(err.message);

                // Initialize with one empty segment even on error
                setSegments([{
                    from: { name: '', lat: '', lng: '' },
                    to: { name: '', lat: '', lng: '' },
                    transport: 'car',
                    description: ''
                }]);

                setLoading(false);
            }
        }

        fetchTripData();
    }, [tripId, isNewTrip]);

    // Handle trip data form changes
    const handleTripDataChange = (e) => {
        const { name, value } = e.target;
        setTripData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle segment form changes
    const handleSegmentChange = (index, field, subfield, value) => {
        setSegments(prev => {
            const newSegments = [...prev];

            if (subfield) {
                // Handle nested fields like from.name, from.lat, etc.
                newSegments[index] = {
                    ...newSegments[index],
                    [field]: {
                        ...newSegments[index][field],
                        [subfield]: value
                    }
                };
            } else {
                // Handle direct fields like transport, description
                newSegments[index] = {
                    ...newSegments[index],
                    [field]: value
                };
            }

            return newSegments;
        });
    };

    // Add a new segment
    const addSegment = () => {
        setSegments(prev => [
            ...prev,
            {
                from: { name: '', lat: '', lng: '' },
                to: { name: '', lat: '', lng: '' },
                transport: 'car',
                description: ''
            }
        ]);
    };

    // Remove a segment
    const removeSegment = (index) => {
        if (segments.length <= 1) {
            setError("You need at least one segment. You can't remove the last one.");
            return;
        }
        setSegments(prev => prev.filter((_, i) => i !== index));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMessage('');

        // Validate form
        if (!tripData.name.trim()) {
            setError('Trip name is required');
            setSaving(false);
            return;
        }

        if (segments.length === 0) {
            setError('At least one segment is required');
            setSaving(false);
            return;
        }

        // Validate each segment
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            if (!segment.from?.name || !segment.to?.name ||
                !segment.from?.lat || !segment.from?.lng ||
                !segment.to?.lat || !segment.to?.lng) {
                setError(`All location fields are required in segment ${i + 1}`);
                setSaving(false);
                return;
            }
        }

        try {
            const endpoint = '/api/trip-routes';
            const method = isNewTrip ? 'POST' : 'PUT';

            // Make sure we're sending the proper ID type
            const parsedTripId = isNewTrip ? null : parseInt(tripId, 10);

            // Process duration to ensure it's a number
            const processedTripData = {
                ...tripData,
                duration: tripData.duration ? parseInt(tripData.duration, 10) : null
            };

            const body = isNewTrip
                ? { trip: processedTripData, segments }
                : { tripId: parsedTripId, trip: processedTripData, segments };

            console.log('Submitting data:', body);

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save trip');
            }

            setSuccessMessage(`Trip ${isNewTrip ? 'created' : 'updated'} successfully!`);

            // Redirect to trip view page after a short delay
            setTimeout(() => {
                router.push('/trip/admin');
            }, 2000);

        } catch (err) {
            console.error('Error saving trip:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Handle trip deletion
    const handleDelete = async () => {
        if (!isNewTrip && confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
            try {
                setSaving(true);

                const response = await fetch('/api/trip-routes', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ tripId: parseInt(tripId, 10) })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete trip');
                }

                setSuccessMessage('Trip deleted successfully!');

                // Redirect to trip list page after a short delay
                setTimeout(() => {
                    router.push('/trip/admin');
                }, 2000);

            } catch (err) {
                console.error('Error deleting trip:', err);
                setError(err.message);
            } finally {
                setSaving(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="text-xl">Loading trip data...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">
                        {isNewTrip ? 'Create New Trip' : 'Edit Trip'}
                    </h1>
                    <Link
                        href="/trip/admin"
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Back to Trips
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {successMessage}
                    </div>
                )}

                {/* Debug info */}
                {!isNewTrip && (
                    <div className="bg-gray-100 p-4 mb-4 rounded text-sm">
                        <p>Editing Trip ID: {tripId}</p>
                        <p>Available trips: {allTrips.length}</p>
                        <details>
                            <summary>Trip IDs</summary>
                            <ul className="list-disc pl-5">
                                {allTrips.map(t => (
                                    <li key={t.id}>ID {t.id} ({typeof t.id}): {t.name}</li>
                                ))}
                            </ul>
                        </details>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-4">Trip Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="tripName">
                                    Trip Name *
                                </label>
                                <input
                                    type="text"
                                    id="tripName"
                                    name="name"
                                    value={tripData.name}
                                    onChange={handleTripDataChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="tripDate">
                                    Trip Date
                                </label>
                                <input
                                    type="date"
                                    id="tripDate"
                                    name="date"
                                    value={tripData.date}
                                    onChange={handleTripDataChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="tripRegion">
                                    Region
                                </label>
                                <select
                                    id="tripRegion"
                                    name="region"
                                    value={tripData.region}
                                    onChange={handleTripDataChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a Region</option>
                                    {REGION_OPTIONS.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-gray-600 text-xs mt-1">
                                    Select the primary region for this trip
                                </p>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2" htmlFor="tripDuration">
                                    Duration (days)
                                </label>
                                <input
                                    type="number"
                                    id="tripDuration"
                                    name="duration"
                                    value={tripData.duration}
                                    onChange={handleTripDataChange}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Number of days"
                                />
                                <p className="text-gray-600 text-xs mt-1">
                                    How many days does this trip last?
                                </p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-gray-700 font-medium mb-2" htmlFor="tripDescription">
                                Description
                            </label>
                            <textarea
                                id="tripDescription"
                                name="description"
                                value={tripData.description}
                                onChange={handleTripDataChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            ></textarea>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Trip Segments</h2>
                            <button
                                type="button"
                                onClick={addSegment}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Add Segment
                            </button>
                        </div>

                        {segments.length === 0 ? (
                            <div className="bg-gray-100 p-4 rounded-md text-center mb-4">
                                No segments added yet. Click "Add Segment" to create your trip route.
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {segments.map((segment, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-300 rounded-md p-4 relative"
                                    >
                                        <h3 className="font-medium mb-4">Segment {index + 1}</h3>

                                        <button
                                            type="button"
                                            onClick={() => removeSegment(index)}
                                            className="absolute top-4 right-4 text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                            <div>
                                                <h4 className="font-medium mb-2">Starting Point</h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-gray-700 text-sm mb-1">
                                                            Location Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={segment.from?.name || ''}
                                                            onChange={(e) => handleSegmentChange(index, 'from', 'name', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="e.g. London UK"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="block text-gray-700 text-sm mb-1">
                                                                Latitude *
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                value={segment.from?.lat || ''}
                                                                onChange={(e) => handleSegmentChange(index, 'from', 'lat', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="e.g. 51.5074"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700 text-sm mb-1">
                                                                Longitude *
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                value={segment.from?.lng || ''}
                                                                onChange={(e) => handleSegmentChange(index, 'from', 'lng', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="e.g. -0.1278"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-medium mb-2">Destination</h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-gray-700 text-sm mb-1">
                                                            Location Name *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={segment.to?.name || ''}
                                                            onChange={(e) => handleSegmentChange(index, 'to', 'name', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="e.g. Paris France"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="block text-gray-700 text-sm mb-1">
                                                                Latitude *
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                value={segment.to?.lat || ''}
                                                                onChange={(e) => handleSegmentChange(index, 'to', 'lat', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="e.g. 48.8566"
                                                                required
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-700 text-sm mb-1">
                                                                Longitude *
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                value={segment.to?.lng || ''}
                                                                onChange={(e) => handleSegmentChange(index, 'to', 'lng', e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="e.g. 2.3522"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-gray-700 font-medium mb-2">
                                                    Transportation Method
                                                </label>
                                                <select
                                                    value={segment.transport || 'car'}
                                                    onChange={(e) => handleSegmentChange(index, 'transport', null, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {TRANSPORT_OPTIONS.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-gray-700 font-medium mb-2">
                                                    Description
                                                </label>
                                                <input
                                                    type="text"
                                                    value={segment.description || ''}
                                                    onChange={(e) => handleSegmentChange(index, 'description', null, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="e.g. Scenic drive through the mountains"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-between">
                        {!isNewTrip && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                disabled={saving}
                            >
                                {saving ? 'Deleting...' : 'Delete Trip'}
                            </button>
                        )}

                        <div className="flex gap-4">
                            <Link
                                href="/trip/admin"
                                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : isNewTrip ? 'Create Trip' : 'Update Trip'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}