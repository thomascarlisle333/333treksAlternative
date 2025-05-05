import { BlobServiceClient } from '@azure/storage-blob';

// Azure Storage account connection string - store this in your environment variables
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'photos';
const basePath = 'Final';

// Better error handling for the BlobServiceClient initialization
let containerClient;
try {
    // Only create the client if we have a connection string
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
 * Fetches all countries in the Final folder from Azure Blob Storage
 */
export async function GET(request) {
    try {
        // Check if containerClient is initialized
        if (!containerClient) {
            console.error('Container client is not initialized. Check your connection string.');
            return Response.json(
                { error: 'Azure Storage not configured. Check your environment variables.' },
                { status: 500 }
            );
        }

        // List all blobs with the Final prefix to get countries
        const countries = new Set();

        // Get all blobs that start with the basePath
        const blobsIterator = containerClient.listBlobsByHierarchy('/', { prefix: `${basePath}/` });

        // Collect country folders
        for await (const blob of blobsIterator) {
            // If it's a directory (virtual directories in blob storage end with '/')
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

        return Response.json(validCountryData);
    } catch (error) {
        console.error('Error fetching gallery data:', error);
        return Response.json({
            error: 'Failed to load gallery data',
            details: error.message
        }, { status: 500 });
    }
}

/**
 * Fetches all images from a specific city
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

        const cityPath = `${basePath}/${country}/${city}`;
        const images = await getImagesFromFolder(cityPath);

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
 * Helper function to get the first image from a folder in Azure Blob Storage
 */
async function getFirstImageFromFolder(folderPath) {
    try {
        const images = await getImagesFromFolder(folderPath);

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
 */
async function getImagesFromFolder(folderPath) {
    try {
        if (!containerClient) {
            console.error('Container client is not initialized in getImagesFromFolder');
            return [];
        }

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const images = [];

        console.log(`Listing blobs in folder: ${folderPath}`);

        // List all blobs in the folder
        const blobsIterator = containerClient.listBlobsFlat({
            prefix: `${folderPath}/`
        });

        for await (const blob of blobsIterator) {
            // Check if it's a file and has an image extension
            const fileName = blob.name.split('/').pop();
            const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

            if (imageExtensions.includes(fileExt)) {
                // Generate a URL for the blob
                const blobClient = containerClient.getBlobClient(blob.name);
                const url = blobClient.url;

                images.push({
                    name: fileName,
                    path: blob.name, // Full path in the blob storage
                    url: url // Full URL to access the image
                });
            }
        }

        console.log(`Found ${images.length} images in folder: ${folderPath}`);
        return images;
    } catch (error) {
        console.error(`Error getting images from folder ${folderPath}:`, error);
        return [];
    }
}