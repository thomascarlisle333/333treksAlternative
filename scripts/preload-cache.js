// scripts/preload-cache.js
// This script is run during the build process to preload the location cache
const path = require('path');
const fs = require('fs');

// Define possible paths where the route module might be located
const possiblePaths = [
    path.join(process.cwd(), 'app', 'api', 'photo-locations', 'route.js'),
    path.join(process.cwd(), 'src', 'app', 'api', 'photo-locations', 'route.js'),
    // Add more potential paths if needed
];

// Create a dummy preload function that will be used if we can't find the real one
async function dummyPreload() {
    console.log('Running dummy preload function - no locations will be cached');

    // Create empty cache directory and files to prevent errors
    const CACHE_DIR_PATH = path.join(process.cwd(), 'data');
    const LOCATIONS_CACHE_PATH = path.join(CACHE_DIR_PATH, 'photo-locations.json');
    const LAST_UPDATED_PATH = path.join(CACHE_DIR_PATH, 'locations-last-updated.txt');

    try {
        // Create directory if it doesn't exist
        await fs.promises.mkdir(CACHE_DIR_PATH, { recursive: true });

        // Create empty cache files if they don't exist
        if (!fs.existsSync(LOCATIONS_CACHE_PATH)) {
            await fs.promises.writeFile(LOCATIONS_CACHE_PATH, JSON.stringify([]));
        }

        if (!fs.existsSync(LAST_UPDATED_PATH)) {
            await fs.promises.writeFile(LAST_UPDATED_PATH, Date.now().toString());
        }

        return [];
    } catch (error) {
        console.error('Error creating dummy cache:', error);
        return [];
    }
}

// Try to find and import the route module
async function importRouteModule() {
    // First, try to find the route file
    let routePath = null;

    for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
            routePath = possiblePath;
            console.log(`Found route file at ${routePath}`);
            break;
        } else {
            console.log(`Route file not found at ${possiblePath}`);
        }
    }

    if (!routePath) {
        console.warn('WARNING: Could not find route file in any expected location');
        console.log('Continuing build process with dummy cache');
        return { preloadLocationCache: dummyPreload };
    }

    try {
        // Import the module
        const routeModule = await import(routePath);
        return routeModule;
    } catch (error) {
        console.error('Error importing route module:', error);
        console.log('Continuing build process with dummy cache');
        return { preloadLocationCache: dummyPreload };
    }
}

async function runPreload() {
    console.log('Starting cache preload for photo locations...');

    try {
        const routeModule = await importRouteModule();

        if (!routeModule.preloadLocationCache) {
            console.warn('WARNING: preloadLocationCache function not found in route module');
            console.log('Continuing build process with dummy cache');
            await dummyPreload();
            process.exit(0);
        } else {
            const locations = await routeModule.preloadLocationCache();
            console.log(`Cache preload completed successfully! Cached ${locations.length} locations.`);
            process.exit(0);
        }
    } catch (error) {
        console.error('Error during cache preload:', error);
        console.log('Continuing build process with dummy cache');
        await dummyPreload();
        process.exit(0); // Exit with success to allow build to continue
    }
}

runPreload();