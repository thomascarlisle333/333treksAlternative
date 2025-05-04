// This file should be placed at the root of your project (same level as your src directory)
// File path: middleware.js

import { NextResponse } from 'next/server';

// This function runs before each request to your pages
export function middleware(request) {
    // Only check authentication for admin panel routes
    if (request.nextUrl.pathname.startsWith('/trip/admin')) {
        // Get the auth cookie
        const authCookie = request.cookies.get('trip-admin-auth');

        // If no auth cookie or it's invalid, redirect to login
        if (!authCookie || authCookie.value !== 'authenticated') {
            // Create the login URL with a redirect parameter
            const loginUrl = new URL('/trip/login', request.url);
            loginUrl.searchParams.set('redirect', request.nextUrl.pathname);

            return NextResponse.redirect(loginUrl);
        }
    }

    // Allow the request to continue
    return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
    matcher: [
        // Apply this middleware only to admin routes
        '/trip/admin/:path*'
    ],
};