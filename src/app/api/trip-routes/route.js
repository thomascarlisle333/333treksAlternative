import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'papaparse';

// Define the paths to your CSV files
const TRIPS_CSV_PATH = path.join(process.cwd(), 'data', 'trips.csv');
const SEGMENTS_CSV_PATH = path.join(process.cwd(), 'data', 'trip_segments.csv');

// Define transport type to color mapping
const TRANSPORT_COLORS = {
    'train': '#3498db',  // blue
    'plane': '#9b59b6',  // purple
    'car': '#e74c3c',    // red
    'bus': '#2ecc71',    // green
    'boat': '#f39c12',   // orange
    'bicycle': '#16a085', // teal
    'walking': '#7f8c8d'  // gray
};

// Process trip data from CSV files
async function getTripData() {
    try {
        // Create data directory if it doesn't exist
        const dataDir = path.join(process.cwd(), 'data');
        try {
            await fs.mkdir(dataDir, { recursive: true });
        } catch (error) {
            // Directory already exists or can't be created
            console.error('Error creating data directory:', error);
        }

        // Check if CSV files exist
        const tripsFileExists = await fileExists(TRIPS_CSV_PATH);
        const segmentsFileExists = await fileExists(SEGMENTS_CSV_PATH);

        if (!tripsFileExists || !segmentsFileExists) {
            console.error('CSV files not found:', { tripsFileExists, segmentsFileExists });
            return [];
        }

        // Read data from CSV files with fixed parsing
        let trips = [];
        let segments = [];

        try {
            const tripsContent = await fs.readFile(TRIPS_CSV_PATH, 'utf8');
            const parsedTrips = parse(tripsContent, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true
            });
            trips = parsedTrips.data.map(trip => ({
                ...trip,
                id: Number(trip.id) // Ensure ID is a number
            }));

            const segmentsContent = await fs.readFile(SEGMENTS_CSV_PATH, 'utf8');
            const parsedSegments = parse(segmentsContent, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true
            });
            segments = parsedSegments.data.map(segment => ({
                ...segment,
                trip_id: Number(segment.trip_id) // Ensure trip_id is a number
            }));

            console.log('Loaded trips:', trips.map(t => ({ id: t.id, name: t.name })));
        } catch (err) {
            console.error('Error parsing CSV data:', err);
            throw err;
        }

        // Process and structure the data
        const processedTrips = trips.map(trip => {
            // Filter segments for this trip
            const tripSegments = segments
                .filter(segment => segment.trip_id === trip.id)
                .map(segment => ({
                    from: {
                        name: segment.from_name,
                        lat: segment.from_lat,
                        lng: segment.from_lng
                    },
                    to: {
                        name: segment.to_name,
                        lat: segment.to_lat,
                        lng: segment.to_lng
                    },
                    transport: segment.transport_type,
                    color: TRANSPORT_COLORS[segment.transport_type] || '#95a5a6', // Default color
                    description: segment.description
                }));

            // Extract just the year and month from the date for display
            let formattedDate = trip.date;
            if (formattedDate) {
                try {
                    // Clean up the date string by removing any trailing commas or spaces
                    formattedDate = formattedDate.trim().replace(/,$/, '');

                    // Extract year and month if it looks like a date format with digits
                    const dateMatch = formattedDate.match(/(\d{4})[-\/]?(\d{1,2})[-\/]?(\d{1,2})?/);

                    if (dateMatch) {
                        const year = dateMatch[1];
                        const month = dateMatch[2].padStart(2, '0');
                        const day = dateMatch[3] ? dateMatch[3].padStart(2, '0') : '01';

                        formattedDate = `${year}-${month}-${day}`;
                    } else {
                        // If no date pattern found, try to parse it as a date object
                        const dateObj = new Date(formattedDate);
                        if (!isNaN(dateObj.getTime())) {
                            formattedDate = dateObj.toISOString().split('T')[0];
                        } else {
                            // If all parsing fails, set to null or a placeholder
                            console.error('Unparseable date:', formattedDate);
                            formattedDate = null;
                        }
                    }
                } catch (e) {
                    console.error('Error formatting date:', e);
                }
            }

            // Determine the region based on segments and trip data
            const region = trip.region || determineRegion(tripSegments, trip.name, trip.description);

            // Use duration from CSV if available, otherwise estimate based on segments
            const duration = trip.duration
                ? Number(trip.duration)
                : (tripSegments.length > 5 ? 14 : tripSegments.length * 2);

            return {
                id: trip.id,
                name: trip.name,
                description: trip.description,
                date: formattedDate,
                region: region,
                duration: duration,
                segments: tripSegments
            };
        });

        return processedTrips;
    } catch (error) {
        console.error('Error processing trip data:', error);
        throw error;
    }
}

// Helper function to determine the region based on the trip segments or trip data
function determineRegion(segments, tripName = '', tripDescription = '') {
    // If no segments, try to determine from trip name or description
    if (!segments || segments.length === 0) {
        const combinedText = (tripName + ' ' + tripDescription).toLowerCase();

        if (combinedText.includes("japan") ||
            combinedText.includes("china") ||
            combinedText.includes("korea") ||
            combinedText.includes("thailand") ||
            combinedText.includes("vietnam") ||
            combinedText.includes("asia")) {
            return "Asia";
        } else if (combinedText.includes("france") ||
            combinedText.includes("germany") ||
            combinedText.includes("spain") ||
            combinedText.includes("italy") ||
            combinedText.includes("denmark") ||
            combinedText.includes("iceland") ||
            combinedText.includes("belgium") ||
            combinedText.includes("czech") ||
            combinedText.includes("europe")) {
            return "Europe";
        } else if (combinedText.includes("usa") ||
            combinedText.includes("united states") ||
            combinedText.includes("canada") ||
            combinedText.includes("mexico") ||
            combinedText.includes("north america")) {
            return "North America";
        } else {
            return "Unknown";
        }
    }

    // If we have segments, use the first segment's location
    const firstLocation = segments[0].from.name.toLowerCase();

    if (firstLocation.includes("japan") ||
        firstLocation.includes("china") ||
        firstLocation.includes("korea") ||
        firstLocation.includes("thailand") ||
        firstLocation.includes("vietnam")) {
        return "Asia";
    } else if (firstLocation.includes("france") ||
        firstLocation.includes("germany") ||
        firstLocation.includes("spain") ||
        firstLocation.includes("italy") ||
        firstLocation.includes("denmark") ||
        firstLocation.includes("iceland") ||
        firstLocation.includes("belgium") ||
        firstLocation.includes("czech")) {
        return "Europe";
    } else if (firstLocation.includes("usa") ||
        firstLocation.includes("united states") ||
        firstLocation.includes("canada") ||
        firstLocation.includes("mexico")) {
        return "North America";
    } else {
        return "Unknown";
    }
}

// Helper function to check if a file exists
async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// API route handler
export async function GET(request) {
    try {
        const tripRoutes = await getTripData();
        return NextResponse.json(tripRoutes);
    } catch (error) {
        console.error('Error in trip-routes API route:', error);
        return NextResponse.json(
            { error: 'Failed to fetch trip routes' },
            { status: 500 }
        );
    }
}

// Add a new trip with its segments
export async function POST(request) {
    try {
        const { trip, segments } = await request.json();

        // Read existing data with fixed parsing
        const tripsContent = await fs.readFile(TRIPS_CSV_PATH, 'utf8');
        const parsedTrips = parse(tripsContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });
        const trips = parsedTrips.data.map(t => ({
            ...t,
            id: Number(t.id)
        }));

        const segmentsContent = await fs.readFile(SEGMENTS_CSV_PATH, 'utf8');
        const parsedSegments = parse(segmentsContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });
        const existingSegments = parsedSegments.data.map(s => ({
            ...s,
            id: Number(s.id),
            trip_id: Number(s.trip_id)
        }));

        // Generate new IDs
        const maxTripId = Math.max(0, ...trips.map(t => t.id));
        const tripId = maxTripId + 1;
        const newTrip = {
            id: tripId,
            name: trip.name,
            description: trip.description,
            date: trip.date || new Date().toISOString().split('T')[0],
            duration: trip.duration || null,
            region: trip.region || null
        };

        // Add new trip to trips array
        trips.push(newTrip);

        // Process segments
        const maxSegmentId = Math.max(0, ...existingSegments.map(s => s.id));
        const newSegments = segments.map((segment, index) => ({
            id: maxSegmentId + index + 1,
            trip_id: tripId,
            from_name: segment.from.name,
            from_lat: segment.from.lat,
            from_lng: segment.from.lng,
            to_name: segment.to.name,
            to_lat: segment.to.lat,
            to_lng: segment.to.lng,
            transport_type: segment.transport,
            description: segment.description
        }));

        // Add new segments to segments array
        existingSegments.push(...newSegments);

        // Write updated data back to CSV files
        await writeArrayToCsv(trips, TRIPS_CSV_PATH);
        await writeArrayToCsv(existingSegments, SEGMENTS_CSV_PATH);

        return NextResponse.json({
            success: true,
            tripId: tripId
        });
    } catch (error) {
        console.error('Error adding new trip:', error);
        return NextResponse.json(
            { error: 'Failed to add new trip' },
            { status: 500 }
        );
    }
}

// Helper function to write array to CSV
async function writeArrayToCsv(array, filePath) {
    if (!array || array.length === 0) {
        throw new Error('No data to write to CSV');
    }

    // Get headers from the first object
    const headers = Object.keys(array[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...array.map(row => headers.map(header => {
            // Handle values that might contain commas
            const value = row[header] !== undefined ? String(row[header]) : '';
            return value.includes(',') ? `"${value}"` : value;
        }).join(','))
    ].join('\n');

    await fs.writeFile(filePath, csvContent);
}

// Helper function to update a trip
export async function PUT(request) {
    try {
        const { tripId, trip, segments } = await request.json();
        console.log('PUT request received', { tripId, trip, segments });

        // Read existing data with fixed parsing
        const tripsContent = await fs.readFile(TRIPS_CSV_PATH, 'utf8');
        const parsedTrips = parse(tripsContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });
        const trips = parsedTrips.data.map(t => ({
            ...t,
            id: Number(t.id)
        }));

        const segmentsContent = await fs.readFile(SEGMENTS_CSV_PATH, 'utf8');
        const parsedSegments = parse(segmentsContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });
        const existingSegments = parsedSegments.data.map(s => ({
            ...s,
            id: Number(s.id),
            trip_id: Number(s.trip_id)
        }));

        // Ensure tripId is a number
        const numericTripId = Number(tripId);

        // Find the trip to update
        const tripIndex = trips.findIndex(t => t.id === numericTripId);
        if (tripIndex === -1) {
            console.error(`Trip not found. ID: ${numericTripId}, Available IDs: ${trips.map(t => t.id).join(', ')}`);
            return NextResponse.json(
                { error: `Trip not found with ID: ${tripId}. Available IDs: ${trips.map(t => t.id).join(', ')}` },
                { status: 404 }
            );
        }

        console.log(`Trip found at index ${tripIndex}: ${trips[tripIndex].name}`);

        // Update trip data
        trips[tripIndex] = {
            ...trips[tripIndex],
            name: trip.name || trips[tripIndex].name,
            description: trip.description || trips[tripIndex].description,
            date: trip.date || trips[tripIndex].date,
            duration: trip.duration || trips[tripIndex].duration,
            region: trip.region || trips[tripIndex].region
        };

        // Remove existing segments for this trip
        const filteredSegments = existingSegments.filter(s => s.trip_id !== numericTripId);

        // Process new segments
        const maxSegmentId = Math.max(0, ...existingSegments.map(s => s.id));
        const updatedSegments = segments.map((segment, index) => ({
            id: maxSegmentId + index + 1,
            trip_id: numericTripId,
            from_name: segment.from.name,
            from_lat: segment.from.lat,
            from_lng: segment.from.lng,
            to_name: segment.to.name,
            to_lat: segment.to.lat,
            to_lng: segment.to.lng,
            transport_type: segment.transport,
            description: segment.description
        }));

        // Add updated segments
        filteredSegments.push(...updatedSegments);

        // Write updated data back to CSV files
        await writeArrayToCsv(trips, TRIPS_CSV_PATH);
        await writeArrayToCsv(filteredSegments, SEGMENTS_CSV_PATH);

        return NextResponse.json({
            success: true
        });
    } catch (error) {
        console.error('Error updating trip:', error);
        return NextResponse.json(
            { error: 'Failed to update trip' },
            { status: 500 }
        );
    }
}

// Delete a trip and its segments
export async function DELETE(request) {
    try {
        const { tripId } = await request.json();
        console.log('DELETE request received for trip ID:', tripId);

        // Ensure tripId is a number
        const numericTripId = Number(tripId);

        // Read existing data with fixed parsing
        const tripsContent = await fs.readFile(TRIPS_CSV_PATH, 'utf8');
        const parsedTrips = parse(tripsContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });
        const trips = parsedTrips.data.map(t => ({
            ...t,
            id: Number(t.id)
        }));

        const segmentsContent = await fs.readFile(SEGMENTS_CSV_PATH, 'utf8');
        const parsedSegments = parse(segmentsContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true
        });
        const segments = parsedSegments.data.map(s => ({
            ...s,
            id: Number(s.id),
            trip_id: Number(s.trip_id)
        }));

        // Filter out the trip to delete
        const updatedTrips = trips.filter(trip => trip.id !== numericTripId);

        // Check if any trip was removed
        if (updatedTrips.length === trips.length) {
            console.error(`No trip found with ID: ${numericTripId} to delete`);
            return NextResponse.json(
                { error: `Trip not found with ID: ${tripId}` },
                { status: 404 }
            );
        }

        // Filter out segments associated with the trip
        const updatedSegments = segments.filter(segment => segment.trip_id !== numericTripId);

        // Write updated data back to CSV files
        await writeArrayToCsv(updatedTrips, TRIPS_CSV_PATH);
        await writeArrayToCsv(updatedSegments, SEGMENTS_CSV_PATH);

        return NextResponse.json({
            success: true
        });
    } catch (error) {
        console.error('Error deleting trip:', error);
        return NextResponse.json(
            { error: 'Failed to delete trip' },
            { status: 500 }
        );
    }
}