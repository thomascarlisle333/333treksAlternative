import { NextResponse } from 'next/server';

// This file will serve as an API endpoint to fetch trip route data
// In a real application, this would likely fetch data from a database

export async function GET() {
    try {
        // Sample trip data - in a real application, this would come from a database
        const tripRoutes = [
            {
                id: 5,
                name: "Japan Spring 2025",
                description: "Exploring Japan's main islands and cultural landmarks",
                region: "Asia",
                date: "2025-05",
                duration: 11,
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
                id: 1,
                name: "Northern France Summer 2024",
                description: "A 3 week work trip with lots of site seeing!",
                region: "Europe",
                date: "2024-07",
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
                        color: "#e74c3c", // red for a car ride
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
                    },
                    {
                        from: { name: "Rennes, France", lat: 48.1173, lng: -1.6778},
                        to: { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
                        transport: "car",
                        color: "#3498db", // blue for train
                        description: "Return to Paris by TVG bullet train"
                    }
                ]
            },
            {
                id: 2,
                name: "South Korea Spring 2025",
                description: "Exploring the cultural heritage and natural beauty of South Korea",
                region: "Asia",
                date: "2025-03",
                duration: 3,
                segments: [
                    {
                        from: { name: "Seoul, South Korea", lat: 37.5503, lng: 126.9970 },
                        to: { name: "DMZ, South Korea", lat: 37.7596, lng: 126.7778 },
                        transport: "bus",
                        color: "#2ecc71", // green for bus
                        description: "Scenic mountain bus journey"
                    },
                    {
                        from: { name: "DMZ, South Korea", lat: 37.7596, lng: 126.7778 },
                        to: { name: "Seoul, South Korea", lat: 37.5503, lng: 126.9970 },
                        transport: "bus",
                        color: "#2ecc71", // green for bus
                        description: "Return journey from DMZ"
                    },
                    {
                        from: { name: "Seoul, South Korea", lat: 37.5503, lng: 126.9970 },
                        to: { name: "Busan, South Korea", lat: 35.1731, lng: 129.0714 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "KTX high-speed train to coastal Busan"
                    },
                    {
                        from: { name: "Busan, South Korea", lat: 35.1731, lng: 129.0714 },
                        to: { name: "Seoul, South Korea", lat: 37.5503, lng: 126.9970 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "KTX high-speed train to coastal Busan"
                    },
                    {
                        from: { name: "Seoul, South Korea", lat: 37.5503, lng: 126.9970 },
                        to: { name: "Beijing, China", lat: 40.0799, lng: 116.6031 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "KTX high-speed train to coastal Busan"
                    }
                ]
            },
            {
                id: 3,
                name: "China Spring 2025",
                description: "Work trip in the north, site seeing in the south!",
                region: "Asia",
                date: "2025-03",
                duration: 22,
                segments: [
                    {
                        from: { name: "Seoul, South Korea", lat: 37.5503, lng: 126.9970 },
                        to: { name: "Beijing, China", lat: 40.0799, lng: 116.6031 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Drive down the I-95 corridor"
                    },
                    {
                        from: { name: "Beijing, China", lat: 40.0799, lng: 116.6031 },
                        to: { name: "Changchun, China", lat: 43.8160, lng: 125.3236 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Journey through the Appalachian region"
                    },
                    {
                        from: { name: "Changchun, China", lat: 43.8160, lng: 125.3236 },
                        to: { name: "Gongzhuling, China", lat: 43.5047, lng: 124.8228 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Southern road trip with blues music stops"
                    },
                    {
                        from: { name: "Gongzhuling, China", lat: 43.5047, lng: 124.8228 },
                        to: { name: "Chengde, China", lat: 40.9515, lng: 117.9634 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Gulf Coast drive through Louisiana and Texas"
                    },
                    {
                        from: { name: "Chengde, China", lat: 40.9515, lng: 117.9634 },
                        to: { name: "Beijing, China", lat: 40.0799, lng: 116.6031 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "Amtrak journey through the Southwest"
                    },
                    {
                        from: { name: "Beijing, China", lat: 40.0799, lng: 116.6031 },
                        to: { name: "The Great Wall, China", lat: 40.4327, lng: 116.5640 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Desert drive with stunning landscapes"
                    },
                    {
                        from: { name: "The Great Wall, China", lat: 40.4327, lng: 116.5640 },
                        to: { name: "Beijing, China", lat: 40.0799, lng: 116.6031 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Desert drive with stunning landscapes"
                    },
                    {
                        from: { name: "Beijing, China", lat: 40.0799, lng: 116.6031 },
                        to: { name: "Tiananmen Square, China", lat: 39.9055, lng: 116.3976 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Desert drive with stunning landscapes"
                    },
                    {
                        from: { name: "Tiananmen Square, China", lat: 39.9055, lng: 116.3976 },
                        to: { name: "Temple of Heaven, China", lat: 39.8822, lng: 116.4066 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Scenic route through northern Arizona"
                    },
                    {
                        from: { name: "Temple of Heaven, China", lat: 39.8822, lng: 116.4066 },
                        to: { name: "Summer Palace, China", lat: 40.0000, lng: 116.2755 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Desert crossing to the Pacific coast"
                    },
                    {
                        from: { name: "Summer Palace, China", lat: 40.0000, lng: 116.2755 },
                        to: { name: "Beijing, China", lat: 40.0799, lng: 116.6031 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Desert crossing to the Pacific coast"
                    },
                    {
                        from: { name: "Beijing, China", lat: 40.0799, lng: 116.6031 },
                        to: { name: "Zhangjiajie, China", lat: 29.1167, lng: 110.4784 },
                        transport: "plane",
                        color: "#9b59b6", // purple for plane
                        description: "Desert crossing to the Pacific coast"
                    },
                    {
                        from: { name: "Zhangjiajie, China", lat: 29.1167, lng: 110.4784 },
                        to: { name: "Wulingyuan, China", lat: 29.3459, lng: 110.5504 },
                        transport: "car",
                        color: "#e74c3c", // red for car
                        description: "Desert crossing to the Pacific coast"
                    },
                    {
                        from: { name: "Wulingyuan, China", lat: 29.3459, lng: 110.5504 },
                        to: { name: "Zhangjiajie Glass Bridge, China", lat: 29.3982, lng: 110.6962 },
                        transport: "bus",
                        color: "#2ecc71", // green for bus
                        description: "Desert crossing to the Pacific coast"
                    },
                    {
                        from: { name: "Zhangjiajie Glass Bridge, China", lat: 29.3982, lng: 110.6962 },
                        to: { name: "Tianmen Mountain, China", lat: 29.0468, lng: 110.4821 },
                        transport: "bus",
                        color: "#2ecc71", // green for bus
                        description: "Desert crossing to the Pacific coast"
                    },
                    {
                        from: { name: "Tianmen Mountain, China", lat: 29.0468, lng: 110.4821 },
                        to: { name: "Zhangjiajiebei Railway Station, China", lat: 29.1046, lng: 110.4870 },
                        transport: "bus",
                        color: "#2ecc71", // green for bus
                        description: "Desert crossing to the Pacific coast"
                    },
                    {
                        from: { name: "Zhangjiajiebei Railway Station, China", lat: 29.1046, lng: 110.4870 },
                        to: { name: "Furong Ancient Town, China", lat: 28.7673, lng: 109.9748 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "Desert crossing to the Pacific coast"
                    },
                    {
                        from: { name: "Furong Ancient Town, China", lat: 28.7673, lng: 109.9748 },
                        to: { name: "Fenghuang Ancient Town, China", lat: 27.9484, lng: 109.5983 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "Desert crossing to the Pacific coast"
                    },
                    {
                        from: { name: "Fenghuang Ancient Town, China", lat: 27.9484, lng: 109.5983 },
                        to: { name: "Zhangjiajiebei Railway Station, China", lat: 29.1046, lng: 110.4870 },
                        transport: "train",
                        color: "#3498db", // blue for train
                        description: "Desert crossing to the Pacific coast"
                    },
                    {
                        from: { name: "Zhangjiajiebei Railway Station, China", lat: 29.1046, lng: 110.4870 },
                        to: { name: "72 Qilou Wonder Towers, China", lat: 29.1448, lng: 110.4558 },
                        transport: "car",
                        color: "#e74c3c", // red for train
                        description: "Desert crossing to the Pacific coast"
                    },
                    {
                        from: { name: "72 Qilou Wonder Towers, China", lat: 29.1448, lng: 110.4558 },
                        to: { name: "Zhangjiajie Airport, China", lat: 29.1036, lng: 110.4506 },
                        transport: "car",
                        color: "#e74c3c", // red for train
                        description: "Desert crossing to the Pacific coast"
                    },
                    {
                        from: { name: "Zhangjiajie Airport, China", lat: 29.1036, lng: 110.4506 },
                        to: { name: "Shanghai, China", lat: 31.1443, lng: 121.8083 },
                        transport: "plane",
                        color: "#9b59b6", // purple for plane
                        description: "Desert crossing to the Pacific coast"
                    },
                    {
                        from: { name: "Shanghai Pudong Airport, China", lat: 31.1443, lng: 121.8083 },
                        to: { name: "Nanjing Street, China", lat: 31.2342, lng: 121.4748 },
                        transport: "plane",
                        color: "#9b59b6", // purple for plane
                        description: "Desert crossing to the Pacific coast"
                    },
                    {
                        from: { name: "Nanjing Street, China", lat: 31.2342, lng: 121.4748 },
                        to: { name: "The Bund, China", lat: 31.2363, lng: 121.4911 },
                        transport: "plane",
                        color: "#9b59b6", // purple for plane
                        description: "Desert crossing to the Pacific coast"
                    },
                    {
                        from: { name: "The Bund, China", lat: 31.2363, lng: 121.4911 },
                        to: { name: "Shanghai Tower, China", lat: 31.2335, lng: 121.5056 },
                        transport: "plane",
                        color: "#9b59b6", // purple for plane
                        description: "Desert crossing to the Pacific coast"
                    },
                    {
                        from: { name: "Shanghai Tower, China", lat: 31.2335, lng: 121.5056 },
                        to: { name: "Shanghai Pudong Airport, China", lat: 31.1443, lng: 121.8083 },
                        transport: "plane",
                        color: "#9b59b6", // purple for plane
                        description: "Desert crossing to the Pacific coast"
                    }

                ]
            },
            {
                id: 4,
                name: "Europe Fall 2022",
                description: "Exploring the stunning landscapes and cities of Scandinavia",
                region: "Europe",
                date: "2022-10",
                duration: 21,
                segments: [
                    {
                        from: { name: "New York City, US", lat: 40.6446, lng: -73.7797 },
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
                id: 6,
                name: "Iceland Spring 2024 ",
                description: "Journey through the diverse landscapes of South America",
                region: "Europe",
                date: "2024-04",
                duration: 7,
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
                name: "Europe Winter 2023",
                description: "A quick trip to Portugal, Italy, France, Germany, Scotland, and Hungary!",
                region: "Europe",
                date: "2023-02",
                duration: 15,
                segments: [
                    {
                        from: { name: "New York City, US", lat: 40.6446, lng: -73.7797 },
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
            },
            {
                id: 8,
                name: "Europe Spring 2023",
                description: "Quick Trip to Norway, Sweden, Poland, and Greece!",
                region: "Europe",
                date: "2023-04",
                duration: 10,
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


            },
            {
                id: 9,
                name: "Idaho Summer 2022",
                description: "Quick Trip to Norway, Sweden, Poland, and Greece!",
                region: "North America",
                date: "2022-09",
                duration: 3,
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