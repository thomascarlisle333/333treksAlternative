import { NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';

// Azure Storage account connection string - stored in environment variables
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'photos';
const basePath = 'Final';

// Create a BlobServiceClient
let blobServiceClient, containerClient;

// Simple in-memory cache for the API route
let locationsCache = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Default country coordinates if GPS data isn't available
const countryMap = {
    'USA': { latitude: 37.0902, longitude: -95.7129 },
    'Canada': { latitude: 56.1304, longitude: -106.3468 },
    'UK': { latitude: 55.3781, longitude: -3.4360 },
    'Australia': { latitude: -25.2744, longitude: 133.7751 },
    'Germany': { latitude: 51.1657, longitude: 10.4515 },
    'France': { latitude: 46.2276, longitude: 2.2137 },
    'Italy': { latitude: 41.8719, longitude: 12.5674 },
    'Spain': { latitude: 40.4637, longitude: -3.7492 },
    'Japan': { latitude: 36.2048, longitude: 138.2529 },
    'China': { latitude: 35.8617, longitude: 104.1954 },
    'India': { latitude: 20.5937, longitude: 78.9629 },
    'Brazil': { latitude: -14.2350, longitude: -51.9253 },
    'Belgium': { latitude: 50.5039, longitude: 4.4699 },
    // Add more countries as needed
};

// Initialize Azure Blob Storage client
function initAzureClient() {
    try {
        if (!connectionString) {
            throw new Error('Azure Storage connection string is not defined');
        }

        blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        containerClient = blobServiceClient.getContainerClient(containerName);
        return true;
    } catch (error) {
        console.error('Error initializing Azure Blob Storage client:', error.message);
        return false;
    }
}

// Get photo locations from blob storage
async function getPhotoLocations() {
    // Check if we have a valid cache
    const now = Date.now();
    if (locationsCache && (now - lastCacheUpdate < CACHE_DURATION)) {
        console.log('Returning locations from in-memory cache');
        return locationsCache;
    }

    console.log('Cache expired or not set, fetching fresh data');

    // Initialize Azure client if needed
    if (!containerClient && !initAzureClient()) {
        console.error('Failed to initialize Azure client');
        throw new Error('Failed to connect to Azure Blob Storage');
    }

    const locations = [];

    try {
        // List all country directories
        const countryFolders = new Set();
        const countryIterator = containerClient.listBlobsByHierarchy('/', { prefix: `${basePath}/` });

        for await (const item of countryIterator) {
            if (item.kind === 'prefix') {
                const country = item.name.split('/')[1];
                if (country) countryFolders.add(country);
            }
        }

        // Process each country
        for (const country of countryFolders) {
            // List city directories for this country
            const cityFolders = new Set();
            const cityIterator = containerClient.listBlobsByHierarchy('/', {
                prefix: `${basePath}/${country}/`
            });

            for await (const item of cityIterator) {
                if (item.kind === 'prefix') {
                    const city = item.name.split('/')[2];
                    if (city) cityFolders.add(city);
                }
            }

            // Process each city
            for (const city of cityFolders) {
                // Count photos in this city
                let photoCount = 0;
                const photoIterator = containerClient.listBlobsFlat({
                    prefix: `${basePath}/${country}/${city}/`,
                    maxResults: 100 // Limit to prevent performance issues
                });

                for await (const blob of photoIterator) {
                    const fileName = blob.name.split('/').pop();
                    const fileExt = fileName.split('.').pop().toLowerCase();

                    if (['jpg', 'jpeg', 'png'].includes(fileExt)) {
                        photoCount++;
                    }
                }

                if (photoCount > 0) {
                    // Use default coordinates for country as we're skipping EXIF parsing for speed
                    const coordinates = countryMap[country] || { latitude: 0, longitude: 0 };

                    locations.push({
                        country,
                        city,
                        latitude: coordinates.latitude,
                        longitude: coordinates.longitude,
                        photoCount,
                        isDefaultLocation: true // Mark as default since we're not parsing EXIF
                    });
                }
            }
        }

        // Update the cache
        locationsCache = locations;
        lastCacheUpdate = now;

        return locations;
    } catch (error) {
        console.error('Error getting photo locations:', error);
        throw error;
    }
}

export async function GET() {
    try {
        // Get photo locations
        const locations = await getPhotoLocations();

        // Create a response with the locations
        const response = NextResponse.json(locations);

        // Add cache control headers
        response.headers.set('Cache-Control', 'public, max-age=3600'); // 1 hour

        return response;
    } catch (error) {
        console.error('Error in photo-locations API route:', error);
        return NextResponse.json(
            { error: 'Failed to fetch photo locations', message: error.message },
            { status: 500 }
        );
    }
}