// scripts/preload-cache.js
// This script is run during the build process to preload the location cache

// Import the preloadLocationCache function from the API route
const path = require('path');
const fs = require('fs');

// Dynamically load the route.js file
async function importRouteModule() {
    try {
        // Check if the file exists first
        const routePath = path.join(process.cwd(), 'app', 'api', 'photo-locations', 'route.js');
        if (!fs.existsSync(routePath)) {
            console.error(`Route file not found at ${routePath}`);
            process.exit(1);
        }

        // Import the module
        const routeModule = await import(routePath);
        return routeModule;
    } catch (error) {
        console.error('Error importing route module:', error);
        process.exit(1);
    }
}

async function runPreload() {
    console.log('Starting cache preload for photo locations...');

    try {
        const routeModule = await importRouteModule();

        if (!routeModule.preloadLocationCache) {
            console.error('preloadLocationCache function not found in route module');
            process.exit(1);
        }

        const locations = await routeModule.preloadLocationCache();

        console.log(`Cache preload completed successfully! Cached ${locations.length} locations.`);
        process.exit(0);
    } catch (error) {
        console.error('Error during cache preload:', error);
        process.exit(1);
    }
}

runPreload();