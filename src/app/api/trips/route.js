import { NextResponse } from 'next/server';

// This file will serve as an API endpoint to fetch trip route data
// In a real application, this would likely fetch data from a database

export async function GET() {
    try {
        // Sample trip data - in a real application, this would come from a database
        const tripRoutes = [
            {
                id: 1,
                name: "France 2024",
                description: "A 3 week work trip with lots of site seeing!",
                segments: [
                    {
                        from: { name: "New York City, US", lat: 40.6446, lng: -73.7797 },
                        to: { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
                        transport: "plane",
                        color: "#9b59b6", // purple for plane
                        description: "Delta Flight from JFK to CDG"
                    },
                    {
                        from: { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
                        to: { name: "Bordeaux, France", lat: 44.8416, lng: -0.5811 },
                        transport: "train",
                        color: "#3498db", // blue for train, red for car #e74c3c
                        description: "TVG bullet train through the French Countryside"
                    },
                    {
                        from: { name: "Bordeaux, France", lat: 44.8416, lng: -0.5811 },
                        to: { name: "Pauillac, France", lat: 45.1996, lng: -.7462 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Drive up and down the left bank of Bordeaux wine region"
                    },
                    {
                        from: { name: "Bordeaux, France", lat: 44.8416, lng: -0.5811 },
                        to: { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
                        transport: "train",
                        color: "#3498db", // blue for train, red for car #e74c3c
                        description: "TVG bullet train through the French Countryside"
                    },
                    {
                        from: { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
                        to: { name: "Rennes, France", lat: 48.1173, lng: -1.6778 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "TVG bullet train to get out of Paris"
                    },
                    {
                        from: { name: "Rennes, France", lat: 48.1173, lng: -1.6778 },
                        to: { name: "Mont Saint-Michel, France", lat: 48.6361, lng: -1.5115 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Rural drive through Brittany"
                    },
                    {
                        from: { name: "Mont Saint-Michel, France", lat: 48.6361, lng: -1.5115 },
                        to: { name: "Saint-Goazec, France", lat: 48.1624, lng: -3.7841 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Drive to work Chateau"
                    },
                    {
                        from: { name: "Saint-Goazec, France", lat: 48.1624, lng: -3.7841 },
                        to: { name: "Chateau d'Azay-le-Rideau, France", lat: 47.2590, lng: -0.4657 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Drive to Loire Valley"
                    },
                    {
                        from: { name: "Azay-le-Rideau, France", lat: 47.2590, lng: -0.4657 },
                        to: { name: "Chenonceaux, France", lat: 47.3249, lng: 1.0703 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Scenic drive through the Loire Valley"
                    },
                    {
                        from: { name: "Chenonceaux, France", lat: 47.3249, lng: 1.0703 },
                        to: { name: "Amboise, France", lat: 47.4137, lng: .9861 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Castle hopping!"
                    },
                    {
                        from: { name: "Amboise, France", lat: 47.4137, lng: .9861 },
                        to: { name: "Chambord, France", lat: 47.6158, lng: 1.5169 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Drive to Chambord"
                    },
                    {
                        from: { name: "Chambord, France", lat: 47.6158, lng: 1.5169 },
                        to: { name: "Etretat, France", lat: 49.7070, lng: .2056 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Long drive to the northern coast!"
                    },
                    {
                        from: { name: "Etretat, France", lat: 49.7070, lng: .2056 },
                        to: { name: "Normandy D-Day Beach, France", lat: 49.3585, lng: -0.8545 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Drive along the coast of Normandy"
                    },
                    {
                        from: { name: "Normandy D-Day Beach, France", lat: 49.3585, lng: -0.8545 },
                        to: { name: "Rennes, France", lat: 48.1173, lng: -1.6778 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Return rental car to Rennes"
                    }
                ]
            },
            {
                id: 2,
                name: "Southeast Asia Tour",
                description: "Exploring the cultural heritage and natural beauty of Southeast Asia",
                segments: [
                    {
                        from: { name: "Bangkok, Thailand", lat: 13.7563, lng: 100.5018 },
                        to: { name: "Chiang Mai, Thailand", lat: 18.7883, lng: 98.9853 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "Overnight sleeper train through the Thai countryside"
                    },
                    {
                        from: { name: "Chiang Mai, Thailand", lat: 18.7883, lng: 98.9853 },
                        to: { name: "Luang Prabang, Laos", lat: 19.8563, lng: 102.1347 },
                        transport: "bus",
                        color: "#2ecc71", // green for bus
                        description: "Scenic mountain bus journey"
                    },
                    {
                        from: { name: "Luang Prabang, Laos", lat: 19.8563, lng: 102.1347 },
                        to: { name: "Hanoi, Vietnam", lat: 21.0285, lng: 105.8542 },
                        transport: "plane",
                        color: "#9b59b6", // purple for plane
                        description: "Short regional flight"
                    },
                    {
                        from: { name: "Hanoi, Vietnam", lat: 21.0285, lng: 105.8542 },
                        to: { name: "Ha Long Bay, Vietnam", lat: 20.9101, lng: 107.1839 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Private transfer to the coast"
                    }
                ]
            },
            {
                id: 3,
                name: "USA Road Trip",
                description: "From East Coast to West Coast across the United States",
                segments: [
                    {
                        from: { name: "New York, NY", lat: 40.7128, lng: -74.0060 },
                        to: { name: "Washington DC", lat: 38.9072, lng: -77.0369 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Drive down the I-95 corridor"
                    },
                    {
                        from: { name: "Washington DC", lat: 38.9072, lng: -77.0369 },
                        to: { name: "Nashville, TN", lat: 36.1627, lng: -86.7816 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Journey through the Appalachian region"
                    },
                    {
                        from: { name: "Nashville, TN", lat: 36.1627, lng: -86.7816 },
                        to: { name: "New Orleans, LA", lat: 29.9511, lng: -90.0715 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Southern road trip with blues music stops"
                    },
                    {
                        from: { name: "New Orleans, LA", lat: 29.9511, lng: -90.0715 },
                        to: { name: "Austin, TX", lat: 30.2672, lng: -97.7431 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Gulf Coast drive through Louisiana and Texas"
                    },
                    {
                        from: { name: "Austin, TX", lat: 30.2672, lng: -97.7431 },
                        to: { name: "Santa Fe, NM", lat: 35.6870, lng: -105.9378 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "Amtrak journey through the Southwest"
                    },
                    {
                        from: { name: "Santa Fe, NM", lat: 35.6870, lng: -105.9378 },
                        to: { name: "Grand Canyon, AZ", lat: 36.0544, lng: -112.2225 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Desert drive with stunning landscapes"
                    },
                    {
                        from: { name: "Grand Canyon, AZ", lat: 36.0544, lng: -112.2225 },
                        to: { name: "Las Vegas, NV", lat: 36.1699, lng: -115.1398 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Scenic route through northern Arizona"
                    },
                    {
                        from: { name: "Las Vegas, NV", lat: 36.1699, lng: -115.1398 },
                        to: { name: "Los Angeles, CA", lat: 34.0522, lng: -118.2437 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Desert crossing to the Pacific coast"
                    }
                ]
            }
        ];

        return NextResponse.json(tripRoutes);
    } catch (error) {
        console.error('Error fetching trip routes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch trip routes' },
            { status: 500 }
        );
    }
}