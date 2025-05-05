import { BlobServiceClient } from '@azure/storage-blob';

// Utility function to decode URL components properly
function decodeURIComponentSafe(str) {
    try {
        return decodeURIComponent(str);
    } catch (e) {
        return str;
    }
}

// Azure Storage account connection string - store this in your environment variables
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'photos';
const basePath = 'Final';
const thumbnailPrefix = 'thumbnails';

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
        console.error('AZURE_STORAGE_CONNECTION_STRING is not set in environment variables');
    } else {
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        containerClient = blobServiceClient.getContainerClient(containerName);
    }
} catch (error) {
    console.error('Error initializing Azure Blob Storage client:', error);
}

/**
 * GET handler for countries/cities list - used by the main gallery page
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
 * POST handler for city images - used by the city gallery page
 */
export async function POST(request) {
    try {
        // Check if containerClient is initialized
        if (!containerClient) {
            console.error('Container client is not initialized. Check your connection string.');
            return Response.json(
                { error: 'Azure Storage not configured. Check your environment variables.' },
                { status: 500 }
            );
        }

        const { country, city } = await request.json();

        if (!country || !city) {
            return Response.json({ error: 'Country and city parameters are required' }, { status: 400 });
        }

        // Decode URL-encoded city name (for special characters like umlauts)
        const decodedCity = decodeURIComponentSafe(city);
        const decodedCountry = decodeURIComponentSafe(country);

        console.log(`Fetching images for ${decodedCountry}/${decodedCity}`);

        // Create a cache key for this country/city combination (use decoded values)
        const cacheKey = `${decodedCountry}:${decodedCity}`;

        // Check if we have valid cached data
        const now = Date.now();
        if (CACHE.cities[cacheKey] && CACHE.cities[cacheKey].expiryTime > now) {
            console.log(`Returning ${decodedCity} images from cache`);
            return Response.json({
                country: decodedCountry,
                city: decodedCity,
                images: CACHE.cities[cacheKey].images
            });
        }

        console.log(`Fetching images for ${decodedCountry}/${decodedCity} from Azure...`);
        const cityPath = `${basePath}/${decodedCountry}/${decodedCity}`;

        // Use fuzzy search function for images
        const images = await getImagesFromFolder(cityPath);

        console.log(`Found ${images.length} images for ${decodedCity}`);

        // Store in cache for future requests (use decoded values)
        CACHE.cities[cacheKey] = {
            images,
            expiryTime: now + CACHE.CACHE_TTL
        };

        // Send back properly decoded city and country names
        return Response.json({
            country: decodedCountry,
            city: decodedCity,
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
 * Fetch all countries and their cities with preview images
 */
async function fetchCountriesData() {
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

        console.log(`Found ${countries.size} countries`);

        // Create an array of country data with their first image
        const countryData = await Promise.all(
            Array.from(countries).map(async (country) => {
                try {
                    // Get all cities in this country
                    const citiesSet = new Set();
                    const cityBlobsIterator = containerClient.listBlobsByHierarchy('/', {
                        prefix: `${basePath}/${country}/`
                    });

                    for await (const blob of cityBlobsIterator) {
                        if (blob.kind === 'prefix') {
                            // Extract city name from path (Final/CountryName/CityName/)
                            const cityPath = blob.name;
                            const cityName = cityPath.split('/')[2];

                            if (cityName) {
                                citiesSet.add(cityName);
                            }
                        }
                    }

                    const validCityDirs = Array.from(citiesSet);

                    // If there are no valid city directories, skip this country
                    if (validCityDirs.length === 0) {
                        console.log(`No cities found for country: ${country}`);
                        return null;
                    }

                    console.log(`Found ${validCityDirs.length} cities for country: ${country}`);

                    // Get the first city to find its first image for the country preview
                    const firstCity = validCityDirs[0];
                    const countryPreviewImage = await getFirstImageFromFolder(`${basePath}/${country}/${firstCity}`);

                    // If no images found in the first city, return null
                    if (!countryPreviewImage) {
                        console.log(`No preview image found for country: ${country}`);
                        return null;
                    }

                    // Build country preview path using the full URL
                    const countryPreviewPath = countryPreviewImage.url;
                    // Also get the thumbnail URL for preview
                    const countryPreviewThumbnail = countryPreviewImage.url.replace(`${basePath}/`, `${thumbnailPrefix}/`);

                    const cityData = await Promise.all(
                        validCityDirs.map(async (city) => {
                            try {
                                // Get first image from city folder
                                const firstCityImage = await getFirstImageFromFolder(`${basePath}/${country}/${city}`);

                                // Skip if no images in this city
                                if (!firstCityImage) {
                                    console.log(`No preview image found for city: ${city}`);
                                    return null;
                                }

                                return {
                                    name: city,
                                    path: firstCityImage.url, // Full URL for city preview image
                                    thumbnailPath: firstCityImage.url.replace(`${basePath}/`, `${thumbnailPrefix}/`), // Thumbnail URL
                                    fullPath: `${basePath}/${country}/${city}` // Path for city folder
                                };
                            } catch (cityError) {
                                console.error(`Error processing city ${city}:`, cityError);
                                return null;
                            }
                        })
                    );

                    // Filter out any null values
                    const validCities = cityData.filter(city => city !== null);

                    // If no valid cities with images, skip this country
                    if (validCities.length === 0) {
                        console.log(`No valid cities with images found for country: ${country}`);
                        return null;
                    }

                    return {
                        name: country,
                        path: countryPreviewPath, // Use the first city's first image for country preview
                        thumbnailPath: countryPreviewThumbnail, // Thumbnail version
                        cities: validCities
                    };
                } catch (countryError) {
                    console.error(`Error processing country ${country}:`, countryError);
                    return null;
                }
            })
        );

        // Filter out any null values
        const validCountryData = countryData.filter(country => country !== null);
        console.log(`Returning ${validCountryData.length} valid countries`);

        return validCountryData;
    } catch (error) {
        console.error('Error in fetchCountriesData:', error);
        throw error;
    }
}

/**
 * Helper function to get the first image from a folder in Azure Blob Storage
 */
async function getFirstImageFromFolder(folderPath) {
    try {
        const images = await getImagesFromFolder(folderPath, 1);

        // Return the first image if there are any
        if (images.length > 0) {
            return images[0];
        }

        return null;
    } catch (error) {
        console.error(`Error getting first image from ${folderPath}:`, error);
        return null;
    }
}

/**
 * Helper function to get all images from a folder in Azure Blob Storage
 * With improved handling for special characters
 */
async function getImagesFromFolder(folderPath, limit = null) {
    try {
        if (!containerClient) {
            console.error('Container client is not initialized in getImagesFromFolder');
            return [];
        }

        // Log the exact folder path we're searching
        console.log(`Searching for images in: ${folderPath}`);

        // Split the folder path to work with individual parts
        const pathParts = folderPath.split('/');
        if (pathParts.length < 3) {
            console.error('Invalid folder path, expected at least basePath/country/city');
            return [];
        }

        const pathBase = pathParts[0];
        const pathCountry = pathParts[1];
        const pathCity = pathParts[2];

        // List blobs in the container with a broader prefix to find all city folders
        const blobsIterator = containerClient.listBlobsFlat({
            prefix: `${pathBase}/${pathCountry}/`
        });

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const images = [];

        // Set of all found city folders for debugging
        const foundCities = new Set();
        let citiesToLog = [];

        // Try first with exact matching (more efficient if it works)
        const exactPrefixIterator = containerClient.listBlobsFlat({
            prefix: `${folderPath}/`
        });

        let exactMatch = false;
        for await (const blob of exactPrefixIterator) {
            exactMatch = true;

            // Only process image files
            const fileName = blob.name.split('/').pop();
            const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

            if (imageExtensions.includes(fileExt)) {
                // Generate a URL for the blob
                const blobClient = containerClient.getBlobClient(blob.name);
                const url = blobClient.url;

                // Generate a thumbnail URL by replacing the base path
                const thumbnailPath = blob.name.replace(`${basePath}/`, `${thumbnailPrefix}/`);
                const thumbnailClient = containerClient.getBlobClient(thumbnailPath);
                const thumbnailUrl = thumbnailClient.url;

                images.push({
                    name: fileName,
                    path: blob.name,
                    url: url,
                    thumbnailUrl: thumbnailUrl
                });

                // Break if we've reached the limit
                if (limit && images.length >= limit) {
                    break;
                }
            }
        }

        // If exact match found images, return them
        if (images.length > 0) {
            console.log(`Found ${images.length} images with exact match for: ${folderPath}`);
            return images;
        }

        // No exact match found, try fuzzy matching by normalizing strings
        console.log('No exact match found, trying fuzzy matching...');

        // Normalize the target city name
        const normalizedTargetCity = pathCity
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''); // Remove diacritical marks

        console.log(`Normalized city name: ${normalizedTargetCity}`);

        // Scan all blobs to find fuzzy matches
        for await (const blob of blobsIterator) {
            const blobParts = blob.name.split('/');

            // Skip if not in the expected structure
            if (blobParts.length < 4) continue;

            const blobCity = blobParts[2];
            foundCities.add(blobCity);

            // Normalize for comparison
            const normalizedBlobCity = blobCity
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');

            if (normalizedBlobCity === normalizedTargetCity ||
                normalizedBlobCity.includes(normalizedTargetCity) ||
                normalizedTargetCity.includes(normalizedBlobCity)) {

                // Store cities for logging (limit to 10)
                if (citiesToLog.length < 10) {
                    citiesToLog.push(`${blobCity} (normalized: ${normalizedBlobCity})`);
                }

                // Found a matching city, check if it's an image
                const fileName = blob.name.split('/').pop();
                const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

                if (imageExtensions.includes(fileExt)) {
                    // Generate a URL for the blob
                    const blobClient = containerClient.getBlobClient(blob.name);
                    const url = blobClient.url;

                    // Generate a thumbnail URL by replacing the base path
                    const thumbnailPath = blob.name.replace(`${basePath}/`, `${thumbnailPrefix}/`);
                    const thumbnailClient = containerClient.getBlobClient(thumbnailPath);
                    const thumbnailUrl = thumbnailClient.url;

                    images.push({
                        name: fileName,
                        path: blob.name,
                        url: url,
                        thumbnailUrl: thumbnailUrl
                    });

                    // Break if we've reached the limit
                    if (limit && images.length >= limit) {
                        break;
                    }
                }
            }
        }

        // Log detailed debugging information
        console.log(`Found ${foundCities.size} cities in country ${pathCountry}`);
        console.log(`Cities similar to target: ${citiesToLog.join(', ')}`);
        console.log(`Found ${images.length} images for fuzzy match of: ${pathCity}`);

        // If still empty, log all cities found
        if (images.length === 0) {
            console.log(`All cities found: ${Array.from(foundCities).slice(0, 20).join(', ')}${foundCities.size > 20 ? '...' : ''}`);
        }

        return images;
    } catch (error) {
        console.error(`Error getting images from folder ${folderPath}:`, error);
        console.error(`Stack trace: ${error.stack}`);
        return [];
    }
}