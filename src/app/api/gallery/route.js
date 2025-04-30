import fs from 'fs/promises';
import path from 'path';

// Base path for the "Final" folder containing all images
const basePath = path.join(process.cwd(), 'public', 'Final');

/**
 * Fetches all countries in the Final folder
 */
export async function GET(request) {
  try {
    // Get all country folders
    const countries = await fs.readdir(basePath);

    // Create an array of country data with their first image
    const countryData = await Promise.all(
      countries.map(async (country) => {
        const countryPath = path.join(basePath, country);
        const stats = await fs.stat(countryPath);

        // Skip if not a directory
        if (!stats.isDirectory()) return null;

        // Get all cities in this country
        const cities = await fs.readdir(countryPath);
        const validCityDirs = [];

        for (const city of cities) {
          const cityPath = path.join(countryPath, city);
          const cityStats = await fs.stat(cityPath);

          // Only consider directories
          if (cityStats.isDirectory()) {
            validCityDirs.push(city);
          }
        }

        // If there are no valid city directories, skip this country
        if (validCityDirs.length === 0) return null;

        // Get the first city to find its first image for the country preview
        const firstCity = validCityDirs[0];
        const firstCityPath = path.join(countryPath, firstCity);
        const countryPreviewImage = await getFirstImageFromFolder(firstCityPath);

        // If no images found in the first city, return null
        if (!countryPreviewImage) return null;

        // Build country preview path using the first city's first image
        const countryPreviewPath = `/Final/${country}/${firstCity}/${countryPreviewImage}`;

        const cityData = await Promise.all(
          validCityDirs.map(async (city) => {
            const cityPath = path.join(countryPath, city);

            // Get first image from city folder
            const firstCityImage = await getFirstImageFromFolder(cityPath);

            // Skip if no images in this city
            if (!firstCityImage) return null;

            return {
              name: city,
              path: `/Final/${country}/${city}/${firstCityImage}`, // Correct path for city image
              fullPath: `/Final/${country}/${city}` // Full path for city folder
            };
          })
        );

        // Filter out any null values
        const validCities = cityData.filter(city => city !== null);

        // If no valid cities with images, skip this country
        if (validCities.length === 0) return null;

        return {
          name: country,
          path: countryPreviewPath, // Use the first city's first image for country preview
          cities: validCities
        };
      })
    );

    // Filter out any null values
    const validCountryData = countryData.filter(country => country !== null);

    return Response.json(validCountryData);
  } catch (error) {
    console.error('Error fetching gallery data:', error);
    return Response.json({ error: 'Failed to load gallery data' }, { status: 500 });
  }
}

/**
 * Fetches all images from a specific city
 */
export async function POST(request) {
  try {
    const { country, city } = await request.json();

    if (!country || !city) {
      return Response.json({ error: 'Country and city parameters are required' }, { status: 400 });
    }

    const cityPath = path.join(basePath, country, city);
    const files = await fs.readdir(cityPath);

    // Filter for image files only
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    const images = imageFiles.map(file => ({
      name: file,
      path: `/Final/${country}/${city}/${file}` // Correct path for images
    }));

    return Response.json({
      country,
      city,
      images
    });
  } catch (error) {
    console.error('Error fetching city images:', error);
    return Response.json({ error: 'Failed to load city images' }, { status: 500 });
  }
}

/**
 * Helper function to get the first image from a folder
 */
async function getFirstImageFromFolder(folderPath) {
  try {
    const files = await fs.readdir(folderPath);

    // Filter for image files only
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    // Return the first image file if there are any
    if (imageFiles.length > 0) {
      return imageFiles[0]; // Returning the first image
    }

    return null;
  } catch (error) {
    console.error('Error getting first image:', error);
    return null;
  }
}