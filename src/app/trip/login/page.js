'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';

// Component that uses useSearchParams - this needs to be wrapped in Suspense
function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectPath = searchParams.get('redirect') || '/trip/admin';

    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // The admin password - in a real app, this would be stored on the server
    // For a more secure implementation, you would use an environment variable
    const ADMIN_PASSWORD = '333treks2025'; // Change this to your preferred password

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simple password check
        if (password === ADMIN_PASSWORD) {
            // Set a cookie to remember authentication
            Cookies.set('trip-admin-auth', 'authenticated', {
                expires: 1, // Expires in 1 day
                path: '/'
            });

            // Redirect to the admin panel or requested page
            router.push(redirectPath);
        } else {
            setError('Invalid password. Please try again.');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter admin password"
                    required
                />
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="flex items-center justify-between">
                <Link
                    href="/trip"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                >
                    Return to trips
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </div>
        </form>
    );
}

// Loading fallback for the form
function LoginFormSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="mb-6">
                <div className="h-5 w-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-10 w-full bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-10 w-20 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="max-w-md w-full px-6 py-8 bg-white shadow-md rounded-lg">
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold mb-2">Admin Login</h1>
                    <p className="text-gray-600">Enter your password to access the trip admin panel</p>
                </div>

                {/* Wrap the component that uses useSearchParams in a Suspense boundary */}
                <Suspense fallback={<LoginFormSkeleton />}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}