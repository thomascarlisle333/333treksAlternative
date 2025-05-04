'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = () => {
        // Remove the authentication cookie
        Cookies.remove('trip-admin-auth', { path: '/' });

        // Redirect to the trips page
        router.push('/trip');
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
            Logout
        </button>
    );
}