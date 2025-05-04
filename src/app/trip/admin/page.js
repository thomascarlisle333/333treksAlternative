'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoutButton from '../../../components/LogoutButton';  // Updated path for src directory structure

export default function AdminPanel() {
    const router = useRouter();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch trip data
        async function fetchTrips() {
            try {
                const response = await fetch('/api/trip-routes');

                if (!response.ok) {
                    throw new Error('Failed to fetch trip data');
                }

                const data = await response.json();

                // Sort trips by date (newest first)
                const sortedTrips = [...data].sort((a, b) => {
                    if (!a.date) return 1;
                    if (!b.date) return -1;
                    return b.date.localeCompare(a.date);
                });

                setTrips(sortedTrips);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching trips:', err);
                setError(err.message);
                setLoading(false);
            }
        }

        fetchTrips();
    }, []);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'No date';

        const parts = dateString.split('-');
        if (parts.length < 2) return dateString;

        const date = new Date(parts[0], parts[1] - 1, parts.length > 2 ? parts[2] : 1);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="text-xl">Loading trips...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="text-xl text-red-600">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Trip Admin Panel</h1>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <Link
                            href="/trip"
                            className="px-6 py-3 bg-gray-800 text-white rounded-lg font-medium transition-colors hover:bg-gray-700"
                        >
                            Return to Trips
                        </Link>
                        <Link
                            href="/trip/admin/edit/new"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700"
                        >
                            Create New Trip
                        </Link>
                        <LogoutButton />
                    </div>
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-xl font-semibold">All Trips</h2>
                        <p className="text-gray-600">Manage your travel journeys</p>
                    </div>

                    {trips.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p className="mb-4">No trips found.</p>
                            <p>Create your first trip to get started!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Region
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Segments
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {trips.map((trip) => (
                                    <tr key={trip.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {trip.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{trip.name}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">
                                                {trip.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(trip.date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {trip.region || 'Unknown'}
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {trip.duration ? `${trip.duration} days` : 'Not set'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {trip.segments?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link
                                                href={`/trip/admin/edit/${trip.id}`}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </Link>
                                            <Link
                                                href={`/trip?selected=${trip.id}`}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}