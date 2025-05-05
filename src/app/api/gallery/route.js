// route.js for /api/gallery endpoint
import { BlobServiceClient } from '@azure/storage-blob';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'photos';
const basePath = 'Final';

// In-memory cache to store API responses
const CACHE = {
    countries: null,
    cities: {},
    expiryTime: null,
    CACHE_TTL: 3600000 // 1 hour in milliseconds
};

let containerClient;
try {
    if (!connectionString) {
        console.error('AZURE_STORAGE_CONNECTION_STRING is not set');
    } else {
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        containerClient = blobServiceClient.getContainerClient(containerName);
    }
} catch (error) {
    console.error('Error initializing Azure Blob Storage client:', error);
}

/**
 * GET handler with efficient caching for countries/cities list
 */
export async function GET(request) {
    try {
        // Check if we have valid cached data
        const now = Date.now();
        if (CACHE.countries && CACHE.expiryTime && CACHE.expiryTime > now) {
            console.log('Returning countries from cache');
            return Response.json(CACHE.countries);
        }

        // Fetch from Azure if not in cache
        if (!containerClient) {
            return Response.json(
                { error: 'Azure Storage not configured. Check your environment variables.' },
                { status: 500 }
            );
        }

        console.log('Fetching countries data from Azure...');
        const countriesData = await fetchCountriesData();

        // Store in cache for future requests
        CACHE.countries = countriesData;
        CACHE.expiryTime = now + CACHE.CACHE_TTL;

        return Response.json(countriesData);
    } catch (error) {
        console.error('Error fetching gallery data:', error);
        return Response.json({
            error: 'Failed to load gallery data',
            details: error.message
        }, { status: 500 });
    }
}

/**
 * POST handler with caching for city images
 */
export async function POST(request) {
    try {
        const { country, city } = await request.json();

        if (!country || !city) {
            return Response.json({ error: 'Country and city parameters are required' }, { status: 400 });
        }

        // Create a cache key for this country/city combination
        const cacheKey = `${country}:${city}`;

        // Check if we have valid cached data
        const now = Date.now();
        if (CACHE.cities[cacheKey] && CACHE.cities[cacheKey].expiryTime > now) {
            console.log(`Returning ${city} images from cache`);
            return Response.json({
                country,
                city,
                images: CACHE.cities[cacheKey].images
            });
        }

        // Fetch from Azure if not in cache
        if (!containerClient) {
            return Response.json(
                { error: 'Azure Storage not configured. Check your environment variables.' },
                { status: 500 }
            );
        }

        console.log(`Fetching images for ${country}/${city} from Azure...`);
        const cityPath = `${basePath}/${country}/${city}`;
        const images = await getImagesFromFolder(cityPath);

        // Store in cache for future requests
        CACHE.cities[cacheKey] = {
            images,
            expiryTime: now + CACHE.CACHE_TTL
        };

        return Response.json({
            country,
            city,
            images
        });
    } catch (error) {
        console.error('Error fetching city images:', error);
        return Response.json({
            error: 'Failed to load city images',
            details: error.message
        }, { status: 500 });
    }
}

/**
 * Efficiently fetch all countries and their cities with preview images
 */
async function fetchCountriesData() {
    try {
        // Get all country directories
        const countries = new Set();
        const blobsIterator = containerClient.listBlobsByHierarchy('/', { prefix: `${basePath}/` });

        for await (const blob of blobsIterator) {
            if (blob.kind === 'prefix') {
                const countryPath = blob.name;
                const countryName = countryPath.split('/')[1];

                if (countryName) {
                    countries.add(countryName);
                }
            }
        }

        console.log(`Found ${countries.size} countries`);

        // Build country data in parallel (much faster)
        const countryPromises = Array.from(countries).map(async (country) => {
            try {
                // Get all cities for this country
                const citiesSet = new Set();
                const cityBlobsIterator = containerClient.listBlobsByHierarchy('/', {
                    prefix: `${basePath}/${country}/`
                });

                for await (const blob of cityBlobsIterator) {
                    if (blob.kind === 'prefix') {
                        const cityPath = blob.name;
                        const cityName = cityPath.split('/')[2];

                        if (cityName) {
                            citiesSet.add(cityName);
                        }
                    }
                }

                const cities = Array.from(citiesSet);

                if (cities.length === 0) {
                    console.log(`No cities found for country: ${country}`);
                    return null;
                }

                // Process cities in parallel
                const cityPromises = cities.map(async (city) => {
                    try {
                        // Get first image from city folder (for preview)
                        const cityPath = `${basePath}/${country}/${city}`;
                        const firstImage = await getFirstImageFromFolder(cityPath);

                        if (!firstImage) {
                            console.log(`No preview image found for city: ${city}`);
                            return null;
                        }

                        return {
                            name: city,
                            path: firstImage.url,
                            fullPath: cityPath
                        };
                    } catch (cityError) {
                        console.error(`Error processing city ${city}:`, cityError);
                        return null;
                    }
                });

                // Wait for all city promises to resolve
                const cityResults = await Promise.all(cityPromises);
                const validCities = cityResults.filter(city => city !== null);

                if (validCities.length === 0) {
                    console.log(`No valid cities with images found for country: ${country}`);
                    return null;
                }

                // Use the first city's first image as the country preview
                const countryPreviewPath = validCities[0].path;

                return {
                    name: country,
                    path: countryPreviewPath,
                    cities: validCities
                };
            } catch (countryError) {
                console.error(`Error processing country ${country}:`, countryError);
                return null;
            }
        });

        // Wait for all country promises to resolve
        const countryResults = await Promise.all(countryPromises);
        const validCountries = countryResults.filter(country => country !== null);

        console.log(`Returning ${validCountries.length} valid countries`);
        return validCountries;
    } catch (error) {
        console.error('Error in fetchCountriesData:', error);
        throw error;
    }
}

/**
 * Helper function to get the first image from a folder
 */
async function getFirstImageFromFolder(folderPath) {
    try {
        // Get maximum 1 image
        const images = await getImagesFromFolder(folderPath, 1);
        return images.length > 0 ? images[0] : null;
    } catch (error) {
        console.error(`Error getting first image from ${folderPath}:`, error);
        return null;
    }
}

/**
 * Helper function to get images from a folder with a limit option
 */
async function getImagesFromFolder(folderPath, limit = null) {
    try {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const images = [];

        // List blobs in the folder
        const blobsIterator = containerClient.listBlobsFlat({
            prefix: `${folderPath}/`
        });

        for await (const blob of blobsIterator) {
            // Break early if we hit the limit
            if (limit && images.length >= limit) {
                break;
            }

            // Check if it's an image file
            const fileName = blob.name.split('/').pop();
            const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

            if (imageExtensions.includes(fileExt)) {
                // Generate a URL for the blob
                const blobClient = containerClient.getBlobClient(blob.name);
                const url = blobClient.url;

                images.push({
                    name: fileName,
                    path: blob.name,
                    url: url
                });
            }
        }

        return images;
    } catch (error) {
        console.error(`Error getting images from folder ${folderPath}:`, error);
        return [];
    }
}