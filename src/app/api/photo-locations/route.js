import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import exifr from 'exifr';
import { BlobServiceClient } from '@azure/storage-blob';

// Azure Storage account connection string - stored in environment variables
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const storageAccountName = '333treksphotos';
const containerName = 'photos';
const basePath = 'Final';

// Create a BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Helper function to convert GPS coordinates to decimal format
function convertDMSToDD(degrees, minutes, seconds, direction) {
    let dd = degrees + minutes / 60 + seconds / 3600;
    if (direction === 'S' || direction === 'W') {
        dd = dd * -1;
    }
    return dd;
}

// Extract GPS coordinates from a photo blob
async function extractGPSFromBlob(blobClient) {
    try {
        // Download the blob as an array buffer
        const downloadedBlobResponse = await blobClient.download();
        const blobContents = await streamToBuffer(downloadedBlobResponse.readableStreamBody);

        // Parse EXIF data including GPS
        const gps = await exifr.gps(blobContents);

        if (gps && typeof gps.latitude === 'number' && typeof gps.longitude === 'number') {
            return {
                latitude: gps.latitude,
                longitude: gps.longitude
            };
        }

        // Try to parse the full EXIF data if the GPS module doesn't work
        const exif = await exifr.parse(blobContents, { gps: true });

        if (exif && exif.GPSLatitude && exif.GPSLongitude) {
            // Convert coordinates if they're in degrees/minutes/seconds format
            if (Array.isArray(exif.GPSLatitude) && Array.isArray(exif.GPSLongitude)) {
                const latitude = convertDMSToDD(
                    exif.GPSLatitude[0],
                    exif.GPSLatitude[1],
                    exif.GPSLatitude[2],
                    exif.GPSLatitudeRef || 'N'
                );

                const longitude = convertDMSToDD(
                    exif.GPSLongitude[0],
                    exif.GPSLongitude[1],
                    exif.GPSLongitude[2],
                    exif.GPSLongitudeRef || 'E'
                );

                return { latitude, longitude };
            }
        }

        return null;
    } catch (error) {
        console.error(`Error extracting GPS data from blob ${blobClient.name}:`, error);
        return null;
    }
}

// Helper function to convert a readable stream to a buffer
async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
    });
}

// Fallback coordinates based on country if GPS data isn't available
function getDefaultCoordinatesForCountry(country) {
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

    return countryMap[country] || { latitude: 0, longitude: 0 };
}

// Cache for storing previously extracted coordinates
// This helps avoid re-processing the same photos on every API call
const coordinatesCache = new Map();
const CACHE_FILE_PATH = path.join(process.cwd(), 'data', 'coordinates-cache.json');

// Load cache from file if it exists
async function loadCoordinatesCache() {
    try {
        const cacheData = await fs.readFile(CACHE_FILE_PATH, 'utf8');
        const parsedCache = JSON.parse(cacheData);

        // Convert the object back to a Map
        Object.entries(parsedCache).forEach(([key, value]) => {
            coordinatesCache.set(key, value);
        });

        console.log(`Loaded ${coordinatesCache.size} cached locations`);
    } catch (error) {
        // If file doesn't exist or can't be read, just start with an empty cache
        console.log('No coordinates cache found, starting fresh');
    }
}

// Save cache to file
async function saveCoordinatesCache() {
    try {
        // Create directory if it doesn't exist
        await fs.mkdir(path.dirname(CACHE_FILE_PATH), { recursive: true });

        // Convert Map to object for JSON serialization
        const cacheObject = Object.fromEntries(coordinatesCache);
        await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(cacheObject, null, 2));
        console.log(`Saved ${coordinatesCache.size} locations to cache`);
    } catch (error) {
        console.error('Error saving coordinates cache:', error);
    }
}

// Get all photos and their GPS data from Azure Blob Storage
async function getPhotoLocations() {
    // Try to load the cache first
    await loadCoordinatesCache();

    // Check if containerClient is initialized
    if (!containerClient) {
        console.error('Container client is not initialized. Check your connection string.');
        return [];
    }

    const locations = [];
    let newCoordinatesFound = false;

    try {
        // Get all countries (first level directories in Final/)
        const countries = new Set();
        const countryBlobsIterator = containerClient.listBlobsByHierarchy('/', {
            prefix: `${basePath}/`
        });

        for await (const blob of countryBlobsIterator) {
            if (blob.kind === 'prefix') {
                // Extract country name from path (Final/CountryName/)
                const countryPath = blob.name;
                const countryName = countryPath.split('/')[1];

                if (countryName) {
                    countries.add(countryName);
                }
            }
        }

        // Process each country
        for (const country of Array.from(countries)) {
            // Get all cities in this country
            const cities = new Set();
            const cityBlobsIterator = containerClient.listBlobsByHierarchy('/', {
                prefix: `${basePath}/${country}/`
            });

            for await (const blob of cityBlobsIterator) {
                if (blob.kind === 'prefix') {
                    // Extract city name from path (Final/CountryName/CityName/)
                    const cityPath = blob.name;
                    const cityName = cityPath.split('/')[2];

                    if (cityName) {
                        cities.add(cityName);
                    }
                }
            }

            // Process each city
            for (const city of Array.from(cities)) {
                // Get all photos in this city
                const photoFiles = [];
                const photoBlobsIterator = containerClient.listBlobsFlat({
                    prefix: `${basePath}/${country}/${city}/`
                });

                for await (const blob of photoBlobsIterator) {
                    const fileName = blob.name.split('/').pop();
                    const fileExt = path.extname(fileName).toLowerCase();

                    if (['.jpg', '.jpeg', '.png'].includes(fileExt)) {
                        photoFiles.push(blob.name);
                    }
                }

                if (photoFiles.length === 0) continue;

                // Check if we have cached coordinates for this location
                const locationKey = `${country}-${city}`;
                let coordinates;

                if (coordinatesCache.has(locationKey)) {
                    coordinates = coordinatesCache.get(locationKey);
                } else {
                    // Try to extract GPS data from photos
                    let gpsFound = false;

                    for (const photoPath of photoFiles) {
                        if (gpsFound) break;

                        const blobClient = containerClient.getBlobClient(photoPath);
                        const gpsCoordinates = await extractGPSFromBlob(blobClient);

                        if (gpsCoordinates) {
                            coordinates = gpsCoordinates;
                            gpsFound = true;

                            // Save to cache
                            coordinatesCache.set(locationKey, coordinates);
                            newCoordinatesFound = true;
                        }
                    }

                    // If no GPS data found in any photo, use a fallback
                    if (!gpsFound) {
                        coordinates = getDefaultCoordinatesForCountry(country);
                        // Store fallback in cache but mark it
                        coordinatesCache.set(locationKey, {
                            ...coordinates,
                            isDefault: true
                        });
                        newCoordinatesFound = true;
                    }
                }

                locations.push({
                    country,
                    city,
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                    photoCount: photoFiles.length,
                    isDefaultLocation: coordinates.isDefault || false
                });
            }
        }

        // If we found new coordinates, save the cache
        if (newCoordinatesFound) {
            await saveCoordinatesCache();
        }

        return locations;
    } catch (error) {
        console.error('Error getting photo locations:', error);
        return [];
    }
}

export async function GET() {
    try {
        const locations = await getPhotoLocations();
        return NextResponse.json(locations);
    } catch (error) {
        console.error('Error in photo-locations API route:', error);
        return NextResponse.json(
            { error: 'Failed to fetch photo locations', details: error.message },
            { status: 500 }
        );
    }
}