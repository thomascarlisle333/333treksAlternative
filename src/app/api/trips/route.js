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
                region: "Europe",
                date: "2024-06",
                duration: 21,
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
                        color: "#3498db", // blue for train
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
                        color: "#3498db", // blue for train
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
                region: "Asia",
                date: "2024-02",
                duration: 14,
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
                region: "North America",
                date: "2023-07",
                duration: 18,
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
            },
            {
                id: 4,
                name: "Scandinavian Adventure",
                description: "Exploring the stunning landscapes and cities of Scandinavia",
                region: "Europe",
                date: "2023-12",
                duration: 12,
                segments: [
                    {
                        from: { name: "Copenhagen, Denmark", lat: 55.6761, lng: 12.5683 },
                        to: { name: "Odense, Denmark", lat: 55.4038, lng: 10.4024 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "High-speed train through Danish countryside"
                    },
                    {
                        from: { name: "Odense, Denmark", lat: 55.4038, lng: 10.4024 },
                        to: { name: "Aarhus, Denmark", lat: 56.1629, lng: 10.2039 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Coastal drive with views of the Baltic Sea"
                    },
                    {
                        from: { name: "Aarhus, Denmark", lat: 56.1629, lng: 10.2039 },
                        to: { name: "Gothenburg, Sweden", lat: 57.7089, lng: 11.9746 },
                        transport: "boat",
                        color: "#1abc9c", // teal for boat
                        description: "Ferry across the Kattegat"
                    },
                    {
                        from: { name: "Gothenburg, Sweden", lat: 57.7089, lng: 11.9746 },
                        to: { name: "Stockholm, Sweden", lat: 59.3293, lng: 18.0686 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "Train through Swedish forests and lakes"
                    },
                    {
                        from: { name: "Stockholm, Sweden", lat: 59.3293, lng: 18.0686 },
                        to: { name: "Helsinki, Finland", lat: 60.1699, lng: 24.9384 },
                        transport: "boat",
                        color: "#1abc9c", // teal for boat
                        description: "Overnight cruise across the Baltic Sea"
                    },
                    {
                        from: { name: "Helsinki, Finland", lat: 60.1699, lng: 24.9384 },
                        to: { name: "Rovaniemi, Finland", lat: 66.5039, lng: 25.7294 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "Train journey to the Arctic Circle"
                    }
                ]
            },
            {
                id: 5,
                name: "Japanese Island Hopping",
                description: "Exploring Japan's main islands and cultural landmarks",
                region: "Asia",
                date: "2024-04",
                duration: 16,
                segments: [
                    {
                        from: { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503 },
                        to: { name: "Kyoto, Japan", lat: 35.0116, lng: 135.7681 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "Shinkansen bullet train"
                    },
                    {
                        from: { name: "Kyoto, Japan", lat: 35.0116, lng: 135.7681 },
                        to: { name: "Osaka, Japan", lat: 34.6937, lng: 135.5023 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "Local train through urban Japan"
                    },
                    {
                        from: { name: "Osaka, Japan", lat: 34.6937, lng: 135.5023 },
                        to: { name: "Hiroshima, Japan", lat: 34.3853, lng: 132.4553 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "Bullet train along the coast"
                    },
                    {
                        from: { name: "Hiroshima, Japan", lat: 34.3853, lng: 132.4553 },
                        to: { name: "Miyajima Island, Japan", lat: 34.2971, lng: 132.3197 },
                        transport: "boat",
                        color: "#1abc9c", // teal for boat
                        description: "Ferry to the sacred island"
                    },
                    {
                        from: { name: "Miyajima Island, Japan", lat: 34.2971, lng: 132.3197 },
                        to: { name: "Fukuoka, Japan", lat: 33.5902, lng: 130.4017 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "Train to Kyushu Island"
                    },
                    {
                        from: { name: "Fukuoka, Japan", lat: 33.5902, lng: 130.4017 },
                        to: { name: "Nagasaki, Japan", lat: 32.7503, lng: 129.8779 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "Coastal train through southern Japan"
                    },
                    {
                        from: { name: "Nagasaki, Japan", lat: 32.7503, lng: 129.8779 },
                        to: { name: "Sapporo, Japan", lat: 43.0618, lng: 141.3545 },
                        transport: "plane",
                        color: "#9b59b6", // purple for plane
                        description: "Flight to Hokkaido Island"
                    }
                ]
            },
            {
                id: 6,
                name: "South American Expedition",
                description: "Journey through the diverse landscapes of South America",
                region: "South America",
                date: "2023-11",
                duration: 22,
                segments: [
                    {
                        from: { name: "Buenos Aires, Argentina", lat: -34.6037, lng: -58.3816 },
                        to: { name: "Mendoza, Argentina", lat: -32.8908, lng: -68.8272 },
                        transport: "plane",
                        color: "#9b59b6", // purple for plane
                        description: "Flight over the Pampas to wine country"
                    },
                    {
                        from: { name: "Mendoza, Argentina", lat: -32.8908, lng: -68.8272 },
                        to: { name: "Santiago, Chile", lat: -33.4489, lng: -70.6693 },
                        transport: "bus",
                        color: "#2ecc71", // green for bus
                        description: "Bus through the Andes mountain pass"
                    },
                    {
                        from: { name: "Santiago, Chile", lat: -33.4489, lng: -70.6693 },
                        to: { name: "San Pedro de Atacama, Chile", lat: -22.9087, lng: -68.1997 },
                        transport: "plane",
                        color: "#9b59b6", // purple for plane
                        description: "Flight to the driest desert in the world"
                    },
                    {
                        from: { name: "San Pedro de Atacama, Chile", lat: -22.9087, lng: -68.1997 },
                        to: { name: "Uyuni, Bolivia", lat: -20.4598, lng: -66.8263 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "4x4 journey across salt flats"
                    },
                    {
                        from: { name: "Uyuni, Bolivia", lat: -20.4598, lng: -66.8263 },
                        to: { name: "La Paz, Bolivia", lat: -16.4897, lng: -68.1193 },
                        transport: "bus",
                        color: "#2ecc71", // green for bus
                        description: "Highland bus through the Altiplano"
                    },
                    {
                        from: { name: "La Paz, Bolivia", lat: -16.4897, lng: -68.1193 },
                        to: { name: "Cusco, Peru", lat: -13.5301, lng: -71.9675 },
                        transport: "plane",
                        color: "#9b59b6", // purple for plane
                        description: "Flight to the ancient Inca capital"
                    },
                    {
                        from: { name: "Cusco, Peru", lat: -13.5301, lng: -71.9675 },
                        to: { name: "Machu Picchu, Peru", lat: -13.1631, lng: -72.5450 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "Scenic train through the Sacred Valley"
                    }
                ]
            },
            {
                id: 7,
                name: "African Safari",
                description: "Wildlife expedition across Eastern Africa",
                region: "Africa",
                date: "2025-01",
                duration: 15,
                segments: [
                    {
                        from: { name: "Nairobi, Kenya", lat: -1.2921, lng: 36.8219 },
                        to: { name: "Maasai Mara, Kenya", lat: -1.5942, lng: 35.1506 },
                        transport: "plane",
                        color: "#9b59b6", // purple for plane
                        description: "Small aircraft to the savanna"
                    },
                    {
                        from: { name: "Maasai Mara, Kenya", lat: -1.5942, lng: 35.1506 },
                        to: { name: "Serengeti, Tanzania", lat: -2.3333, lng: 34.8333 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "4x4 safari drive across the border"
                    },
                    {
                        from: { name: "Serengeti, Tanzania", lat: -2.3333, lng: 34.8333 },
                        to: { name: "Ngorongoro Crater, Tanzania", lat: -3.1657, lng: 35.6319 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Wildlife spotting drive"
                    },
                    {
                        from: { name: "Ngorongoro Crater, Tanzania", lat: -3.1657, lng: 35.6319 },
                        to: { name: "Lake Manyara, Tanzania", lat: -3.3942, lng: 35.8000 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Scenic drive through national parks"
                    },
                    {
                        from: { name: "Lake Manyara, Tanzania", lat: -3.3942, lng: 35.8000 },
                        to: { name: "Zanzibar, Tanzania", lat: -6.1659, lng: 39.2026 },
                        transport: "plane",
                        color: "#9b59b6", // purple for plane
                        description: "Flight to the spice island"
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