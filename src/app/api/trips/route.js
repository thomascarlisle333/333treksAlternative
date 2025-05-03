import { NextResponse } from 'next/server';

// This file will serve as an API endpoint to fetch trip route data
// In a real application, this would likely fetch data from a database

// Consistent color mapping for transport types
const transportColors = {
    "train": "#3498db", // blue for train
    "plane": "#9b59b6", // purple for plane
    "car": "#e74c3c",   // red for car
    "bus": "#2ecc71",   // green for bus
    "boat": "#1abc9c"   // teal for boat
};

export async function GET() {
    try {
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
                        color: transportColors.train,
                        description: "Shinkansen bullet train"
                    },
                    {
                        from: { name: "Kyoto, Japan", lat: 35.0116, lng: 135.7681 },
                        to: { name: "Osaka, Japan", lat: 34.6937, lng: 135.5023 },
                        transport: "train",
                        color: transportColors.train,
                        description: "Local train through urban Japan"
                    },
                    {
                        from: { name: "Osaka, Japan", lat: 34.6937, lng: 135.5023 },
                        to: { name: "Hiroshima, Japan", lat: 34.3853, lng: 132.4553 },
                        transport: "train",
                        color: transportColors.train,
                        description: "Bullet train along the coast"
                    },
                    {
                        from: { name: "Hiroshima, Japan", lat: 34.3853, lng: 132.4553 },
                        to: { name: "Miyajima Island, Japan", lat: 34.2971, lng: 132.3197 },
                        transport: "boat",
                        color: transportColors.boat,
                        description: "Ferry to the sacred island"
                    },
                    {
                        from: { name: "Miyajima Island, Japan", lat: 34.2971, lng: 132.3197 },
                        to: { name: "Fukuoka, Japan", lat: 33.5902, lng: 130.4017 },
                        transport: "train",
                        color: transportColors.train,
                        description: "Train to Kyushu Island"
                    },
                    {
                        from: { name: "Fukuoka, Japan", lat: 33.5902, lng: 130.4017 },
                        to: { name: "Nagasaki, Japan", lat: 32.7503, lng: 129.8779 },
                        transport: "train",
                        color: transportColors.train,
                        description: "Coastal train through southern Japan"
                    },
                    {
                        from: { name: "Nagasaki, Japan", lat: 32.7503, lng: 129.8779 },
                        to: { name: "Sapporo, Japan", lat: 43.0618, lng: 141.3545 },
                        transport: "plane",
                        color: transportColors.plane,
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
                        from: { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
                        to: { name: "Bordeaux, France", lat: 44.8416, lng: -0.5811 },
                        transport: "train",
                        color: transportColors.train,
                        description: "TVG bullet train through the French Countryside"
                    },
                    {
                        from: { name: "Bordeaux, France", lat: 44.8416, lng: -0.5811 },
                        to: { name: "Pauillac, France", lat: 45.1996, lng: -.7462 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Drive up and down the left bank of Bordeaux wine region"
                    },
                    {
                        from: { name: "Bordeaux, France", lat: 44.8416, lng: -0.5811 },
                        to: { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
                        transport: "train",
                        color: transportColors.train,
                        description: "TVG bullet train through the French Countryside"
                    },
                    {
                        from: { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
                        to: { name: "Rennes, France", lat: 48.1173, lng: -1.6778 },
                        transport: "train",
                        color: transportColors.train,
                        description: "TVG bullet train to get out of Paris"
                    },
                    {
                        from: { name: "Rennes, France", lat: 48.1173, lng: -1.6778 },
                        to: { name: "Mont Saint-Michel, France", lat: 48.6361, lng: -1.5115 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Rural drive through Brittany"
                    },
                    {
                        from: { name: "Mont Saint-Michel, France", lat: 48.6361, lng: -1.5115 },
                        to: { name: "Saint-Goazec, France", lat: 48.1624, lng: -3.7841 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Drive to work Chateau"
                    },
                    {
                        from: { name: "Saint-Goazec, France", lat: 48.1624, lng: -3.7841 },
                        to: { name: "Chateau d'Azay-le-Rideau, France", lat: 47.2590, lng: -0.4657 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Drive to Loire Valley"
                    },
                    {
                        from: { name: "Azay-le-Rideau, France", lat: 47.2590, lng: -0.4657 },
                        to: { name: "Chenonceaux, France", lat: 47.3249, lng: 1.0703 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Scenic drive through the Loire Valley"
                    },
                    {
                        from: { name: "Chenonceaux, France", lat: 47.3249, lng: 1.0703 },
                        to: { name: "Amboise, France", lat: 47.4137, lng: .9861 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Castle hopping!"
                    },
                    {
                        from: { name: "Amboise, France", lat: 47.4137, lng: .9861 },
                        to: { name: "Chambord, France", lat: 47.6158, lng: 1.5169 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Drive to Chambord"
                    },
                    {
                        from: { name: "Chambord, France", lat: 47.6158, lng: 1.5169 },
                        to: { name: "Etretat, France", lat: 49.7070, lng: .2056 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Long drive to the northern coast!"
                    },
                    {
                        from: { name: "Etretat, France", lat: 49.7070, lng: .2056 },
                        to: { name: "Normandy D-Day Beach, France", lat: 49.3585, lng: -0.8545 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Drive along the coast of Normandy"
                    },
                    {
                        from: { name: "Normandy D-Day Beach, France", lat: 49.3585, lng: -0.8545 },
                        to: { name: "Rennes, France", lat: 48.1173, lng: -1.6778 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Return rental car to Rennes"
                    },
                    {
                        from: { name: "Rennes, France", lat: 48.1173, lng: -1.6778},
                        to: { name: "Paris, France", lat: 48.8566, lng: 2.3522 },
                        transport: "train",
                        color: transportColors.train,
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
                        color: transportColors.bus,
                        description: "Scenic mountain bus journey"
                    },
                    {
                        from: { name: "DMZ, South Korea", lat: 37.7596, lng: 126.7778 },
                        to: { name: "Seoul, South Korea", lat: 37.5503, lng: 126.9970 },
                        transport: "bus",
                        color: transportColors.bus,
                        description: "Return journey from DMZ"
                    },
                    {
                        from: { name: "Seoul, South Korea", lat: 37.5503, lng: 126.9970 },
                        to: { name: "Busan, South Korea", lat: 35.1731, lng: 129.0714 },
                        transport: "train",
                        color: transportColors.train,
                        description: "KTX high-speed train to coastal Busan"
                    },
                    {
                        from: { name: "Busan, South Korea", lat: 35.1731, lng: 129.0714 },
                        to: { name: "Seoul, South Korea", lat: 37.5503, lng: 126.9970 },
                        transport: "train",
                        color: transportColors.train,
                        description: "KTX high-speed train to coastal Busan"
                    },
                    {
                        from: { name: "Seoul, South Korea", lat: 37.5503, lng: 126.9970 },
                        to: { name: "Beijing, China", lat: 40.0799, lng: 116.6031 },
                        transport: "plane",
                        color: transportColors.plane,
                        description: "Short flight to Beijing"
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
                        transport: "plane",
                        color: transportColors.plane,
                        description: "Short flight from ICN"
                    },
                    {
                        from: { name: "Beijing, China", lat: 40.0799, lng: 116.6031 },
                        to: { name: "Changchun, China", lat: 43.8160, lng: 125.3236 },
                        transport: "train",
                        color: transportColors.train,
                        description: "Bullet train to Changchun"
                    },
                    {
                        from: { name: "Changchun, China", lat: 43.8160, lng: 125.3236 },
                        to: { name: "Gongzhuling, China", lat: 43.5047, lng: 124.8228 },
                        transport: "train",
                        color: transportColors.train,
                        description: "Bullet train to Gongzhuling"
                    },
                    {
                        from: { name: "Gongzhuling, China", lat: 43.5047, lng: 124.8228 },
                        to: { name: "Chengde, China", lat: 40.9515, lng: 117.9634 },
                        transport: "train",
                        color: transportColors.train,
                        description: "Bullet train to Chengde"
                    },
                    {
                        from: { name: "Chengde, China", lat: 40.9515, lng: 117.9634 },
                        to: { name: "Beijing, China", lat: 40.0799, lng: 116.6031 },
                        transport: "train",
                        color: transportColors.train,
                        description: "Bullet train to Beijing"
                    },
                    {
                        from: { name: "Beijing, China", lat: 40.0799, lng: 116.6031 },
                        to: { name: "The Great Wall, China", lat: 40.4327, lng: 116.5640 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Didi drive to the Great Wall"
                    },
                    {
                        from: { name: "The Great Wall, China", lat: 40.4327, lng: 116.5640 },
                        to: { name: "Beijing, China", lat: 40.0799, lng: 116.6031 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Didi drive back to Beijing"
                    },
                    {
                        from: { name: "Beijing, China", lat: 40.0799, lng: 116.6031 },
                        to: { name: "Tiananmen Square, China", lat: 39.9055, lng: 116.3976 },
                        transport: "train",
                        color: transportColors.train,
                        description: "Subway to Tiananmen Square"
                    },
                    {
                        from: { name: "Tiananmen Square, China", lat: 39.9055, lng: 116.3976 },
                        to: { name: "Temple of Heaven, China", lat: 39.8822, lng: 116.4066 },
                        transport: "train",
                        color: transportColors.train,
                        description: "Subway to Temple of Heaven"
                    },
                    {
                        from: { name: "Temple of Heaven, China", lat: 39.8822, lng: 116.4066 },
                        to: { name: "Summer Palace, China", lat: 40.0000, lng: 116.2755 },
                        transport: "train",
                        color: transportColors.train,
                        description: "Subway to Summer Palace"
                    },
                    {
                        from: { name: "Summer Palace, China", lat: 40.0000, lng: 116.2755 },
                        to: { name: "Beijing, China", lat: 40.0799, lng: 116.6031 },
                        transport: "train",
                        color: transportColors.train,
                        description: "Subway back to PEK airport"
                    },
                    {
                        from: { name: "Beijing, China", lat: 40.0799, lng: 116.6031 },
                        to: { name: "Zhangjiajie, China", lat: 29.1167, lng: 110.4784 },
                        transport: "plane",
                        color: transportColors.plane,
                        description: "Short domestic flight to Zhangjiajie"
                    },
                    // Continuing with remaining segments...
                    {
                        from: { name: "Zhangjiajie, China", lat: 29.1167, lng: 110.4784 },
                        to: { name: "Wulingyuan, China", lat: 29.3459, lng: 110.5504 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Short Didi drive to Wulingyuan"
                    },
                    {
                        from: { name: "Wulingyuan, China", lat: 29.3459, lng: 110.5504 },
                        to: { name: "Zhangjiajie Glass Bridge, China", lat: 29.3982, lng: 110.6962 },
                        transport: "bus",
                        color: transportColors.bus,
                        description: "Tour to China's Grand Canyon"
                    },
                    {
                        from: { name: "Zhangjiajie Glass Bridge, China", lat: 29.3982, lng: 110.6962 },
                        to: { name: "Tianmen Mountain, China", lat: 29.0468, lng: 110.4821 },
                        transport: "bus",
                        color: transportColors.bus,
                        description: "Tour to Tianmen Mountain"
                    },
                    {
                        from: { name: "Tianmen Mountain, China", lat: 29.0468, lng: 110.4821 },
                        to: { name: "Zhangjiajiebei Railway Station, China", lat: 29.1046, lng: 110.4870 },
                        transport: "bus",
                        color: transportColors.bus,
                        description: "Quick bus ride to railway station"
                    },
                    {
                        from: { name: "Zhangjiajiebei Railway Station, China", lat: 29.1046, lng: 110.4870 },
                        to: { name: "Furong Ancient Town, China", lat: 28.7673, lng: 109.9748 },
                        transport: "train",
                        color: transportColors.train,
                        description: "Bullet train to Furong Ancient Town"
                    },
                    {
                        from: { name: "Furong Ancient Town, China", lat: 28.7673, lng: 109.9748 },
                        to: { name: "Fenghuang Ancient Town, China", lat: 27.9484, lng: 109.5983 },
                        transport: "train",
                        color: transportColors.train,
                        description: "Bullet train to Fenghuang Ancient Town"
                    },
                    {
                        from: { name: "Fenghuang Ancient Town, China", lat: 27.9484, lng: 109.5983 },
                        to: { name: "Zhangjiajiebei Railway Station, China", lat: 29.1046, lng: 110.4870 },
                        transport: "train",
                        color: transportColors.train,
                        description: "Bullet train to Zhangjiajiebei Railway Station"
                    },
                    {
                        from: { name: "Zhangjiajiebei Railway Station, China", lat: 29.1046, lng: 110.4870 },
                        to: { name: "72 Qilou Wonder Towers, China", lat: 29.1448, lng: 110.4558 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Didi ride to Qilou Wonder Towers"
                    },
                    {
                        from: { name: "72 Qilou Wonder Towers, China", lat: 29.1448, lng: 110.4558 },
                        to: { name: "Zhangjiajie Airport, China", lat: 29.1036, lng: 110.4506 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Didi ride to Zhangjiajie Airport"
                    },
                    {
                        from: { name: "Zhangjiajie Airport, China", lat: 29.1036, lng: 110.4506 },
                        to: { name: "Shanghai, China", lat: 31.1443, lng: 121.8083 },
                        transport: "plane",
                        color: transportColors.plane,
                        description: "Short domestic flight to Shanghai"
                    },
                    {
                        from: { name: "Shanghai Pudong Airport, China", lat: 31.1443, lng: 121.8083 },
                        to: { name: "Nanjing Street, China", lat: 31.2342, lng: 121.4748 },
                        transport: "train",
                        color: transportColors.train,
                        description: "Maglev train to center of Shanghai"
                    },
                    {
                        from: { name: "Nanjing Street, China", lat: 31.2342, lng: 121.4748 },
                        to: { name: "The Bund, China", lat: 31.2363, lng: 121.4911 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Didi ride to The Bund"
                    },
                    {
                        from: { name: "The Bund, China", lat: 31.2363, lng: 121.4911 },
                        to: { name: "Shanghai Tower, China", lat: 31.2335, lng: 121.5056 },
                        transport: "boat",
                        color: transportColors.boat,
                        description: "Ferry to Shanghai Tower"
                    },
                    {
                        from: { name: "Shanghai Tower, China", lat: 31.2335, lng: 121.5056 },
                        to: { name: "Shanghai Pudong Airport, China", lat: 31.1443, lng: 121.8083 },
                        transport: "train",
                        color: transportColors.train,
                        description: "Maglev back to Pudong Airport"
                    }
                ]
            },
            {
                id: 4,
                name: "Europe Fall 2022",
                description: "Quick trip to Spain, Czech Republic, Malta, France, Germany, Belgium, Luxembourg, Austria, Croatia, and the Netherlands",
                region: "Europe",
                date: "2022-10",
                duration: 21,
                segments: [
                    {
                        from: { name: "Barcelona, Spain", lat: 41.3874, lng: 2.1686 },
                        to: { name: "Prague, Czech Republic", lat: 50.0755, lng: 14.4378 },
                        transport: "plane",
                        color: transportColors.plane, // #9b59b6
                        description: "Short European flight to Czech Republic"
                    },
                    {
                        from: { name: "Prague, Czech Republic", lat: 50.0755, lng: 14.4378 },
                        to: { name: "Valleta, Malta", lat: 35.8517, lng: 14.4863 },
                        transport: "plane",
                        color: transportColors.plane, // #9b59b6
                        description: "Flight to Mediterranean Malta"
                    },
                    {
                        from: { name: "Valleta, Malta", lat: 35.8517, lng: 14.4863 },
                        to: { name: "Paris, France", lat: 49.0079, lng: 2.5508 },
                        transport: "plane",
                        color: transportColors.plane, // #9b59b6
                        description: "Flight to the City of Lights"
                    },
                    {
                        from: { name: "Paris, France", lat: 49.0079, lng: 2.5508 },
                        to: { name: "Munich, Germany", lat: 48.3540, lng: 11.7884 },
                        transport: "plane",
                        color: transportColors.plane, // #9b59b6
                        description: "Short flight to Bavaria"
                    },
                    {
                        from: { name: "Munich, Germany", lat: 48.3540, lng: 11.7884 },
                        to: { name: "Hamburg, Germany", lat: 53.6319, lng: 9.9958 },
                        transport: "plane",
                        color: transportColors.plane, // #3498db
                        description: "Quick flight from southern to northern Germany"
                    },
                    {
                        from: { name: "Hamburg, Germany", lat: 53.6319, lng: 9.9958 },
                        to: { name: "Cloppenburg, Germany", lat: 52.8453, lng: 8.0473 },
                        transport: "car",
                        color: transportColors.car, // #3498db
                        description: "Drive south to work location"
                    },
                    {
                        from: { name: "Cloppenburg, Germany", lat: 52.8453, lng: 8.0473 },
                        to: { name: "Brussels, Belgium", lat: 50.8477, lng: 4.3572 },
                        transport: "car",
                        color: transportColors.car, // #3498db
                        description: "Weekended drive to Brussels"
                    },
                    {
                        from: { name: "Brussels, Belgium", lat: 50.8477, lng: 4.3572 },
                        to: { name: "Dinant, Belgium", lat: 50.2627, lng: 4.9106 },
                        transport: "car",
                        color: transportColors.car, // #3498db
                        description: "Short drive through Belgian countryside"
                    },
                    {
                        from: { name: "Dinant, Belgium", lat: 50.2627, lng: 4.9106 },
                        to: { name: "Luxembourg, Luxembourg", lat: 49.81537, lng: 6.1296 },
                        transport: "car",
                        color: transportColors.car, // #3498db
                        description: "Drive through Luxembourg"
                    },
                    {
                        from: { name: "Luxembourg, Luxembourg", lat: 49.81537, lng: 6.1296 },
                        to: { name: "Vianden, Luxembourg", lat: 49.9340, lng: 6.2092 },
                        transport: "car",
                        color: transportColors.car, // #3498db
                        description: "A scenic spin through Luxembourg's backroads"
                    },
                    {
                        from: { name: "Vianden, Luxembourg", lat: 49.9340, lng: 6.2092 },
                        to: { name: "Emstek, Germany", lat: 52.8343, lng: 8.1555 },
                        transport: "car",
                        color: transportColors.car, // #3498db
                        description: "Joy ride through the German countryside"
                    },
                    {
                        from: { name: "Vianden, Luxembourg", lat: 49.9340, lng: 6.2092 },
                        to: { name: "Emstek, Germany", lat: 52.8343, lng: 8.1555 },
                        transport: "car",
                        color: transportColors.car, // #3498db
                        description: "Joy ride through the German countryside"
                    },
                    {
                        from: { name: "Emstek, Germany", lat: 52.8343, lng: 8.1555 },
                        to: { name: "Garrel, Germany", lat: 52.9531, lng: 8.0256 },
                        transport: "car",
                        color: transportColors.car, // #3498db
                        description: "Drive to hotel"
                    },
                    {
                        from: { name: "Garrel, Germany", lat: 52.9531, lng: 8.0256  },
                        to: { name: "Hamburg, Germany", lat: 53.6319, lng: 9.9958 },
                        transport: "car",
                        color: transportColors.car, // #3498db
                        description: "Speeding on the autobahn back to catch a flight"
                    },
                    {
                        from: { name: "Hamburg, Germany", lat: 53.6319, lng: 9.9958  },
                        to: { name: "Vienna, Austria", lat: 48.2081, lng: 16.3713 },
                        transport: "plane",
                        color: transportColors.plane, // #3498db
                        description: "Jetting off to Vienna"
                    },
                    {
                        from: { name: "Vienna, Austria", lat: 48.2081, lng: 16.3713  },
                        to: { name: "Dubrovnik Airport, Croatia", lat: 42.5606, lng: 18.2618 },
                        transport: "plane",
                        color: transportColors.plane, // #3498db
                        description: "Long haul to Dubrovnik Airport"
                    },
                    {
                        from: { name: "Dubrovnik Airport, Croatia", lat: 42.5606, lng: 18.2618  },
                        to: { name: "Dubrovnik Old Town, Croatia", lat: 42.6410, lng: 18.1104 },
                        transport: "car",
                        color: transportColors.car, // #3498db
                        description: "Taxi to Old Town"
                    },
                    {
                        from: { name: "Dubrovnik Old Town, Croatia", lat: 42.6410, lng: 18.1104  },
                        to: { name: "Dubrovnik Airport, Croatia", lat: 42.5606, lng: 18.2618 },
                        transport: "car",
                        color: transportColors.car, // #3498db
                        description: "Taxi to Airport"
                    },
                    {
                        from: { name: "Dubrovnik Airport, Croatia", lat: 42.5606, lng: 18.2618  },
                        to: { name: "Amsterdam Airport, Netherlands", lat: 52.3169, lng: 4.7459 },
                        transport: "plane",
                        color: transportColors.plane, // #3498db
                        description: "Long haul flight to Amsterdam"
                    },
                    {
                        from: { name: "Amsterdam Airport, Netherlands", lat: 52.3169, lng: 4.7459  },
                        to: { name: "Red Light District, Netherlands", lat: 52.3719, lng: 4.8959 },
                        transport: "train",
                        color: transportColors.train, // #3498db
                        description: "Short train ride to Red Light District"
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
                        from: { name: "Keflavik Airport, Iceland", lat: 63.9845, lng: -22.6266 },
                        to: { name: "Blue Lagoon, Iceland", lat: 63.8807, lng: -22.4473 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Blue Lagoon, Iceland", lat: 63.8807, lng: -22.4473 },
                        to: { name: "Harpa Concert Hall, Iceland", lat: 64.1502, lng: -21.9323 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Harpa Concert Hall, Iceland", lat: 64.1502, lng: -21.9323 },
                        to: { name: "Hallgrimskirkja, Iceland", lat: 64.1420, lng: -21.9265 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Hallgrimskirkja, Iceland", lat: 64.1420, lng: -21.9265 },
                        to: { name: "Helgufoss, Iceland", lat: 64.1750, lng: -21.5317 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Helgufoss, Iceland", lat: 64.1750, lng: -21.5317 },
                        to: { name: "Þórufoss, Iceland", lat: 64.2630, lng: -21.3738 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Þórufoss, Iceland", lat: 64.2630, lng: -21.3738 },
                        to: { name: "Öxarárfoss, Iceland", lat: 64.2659, lng: -21.1171 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Öxarárfoss, Iceland", lat: 64.2659, lng: -21.1171 },
                        to: { name: "Silfra Fissure, Iceland", lat: 64.2563, lng: -21.1161 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Silfra Fissure, Iceland", lat: 64.2563, lng: -21.1161 },
                        to: { name: "Brúarfoss, Iceland", lat: 64.2643, lng: -20.5157 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Brúarfoss, Iceland", lat: 64.2643, lng: -20.5157 },
                        to: { name: "Hotel Geysir, Iceland", lat: 64.3102, lng: -20.3007 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Hotel Geysir, Iceland", lat: 64.3102, lng: -20.3007 },
                        to: { name: "Gullfoss Falls, Iceland", lat: 64.3271, lng: -20.1199 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Gullfoss Falls, Iceland", lat: 64.3271, lng: -20.1199 },
                        to: { name: "Hjálparfoss, Iceland", lat: 64.1160, lng: -19.8495 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Hjálparfoss, Iceland", lat: 64.1160, lng: -19.8495 },
                        to: { name: "Háifoss, Iceland", lat: 64.2079, lng: -19.6869 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Háifoss, Iceland", lat: 64.2079, lng: -19.6869 },
                        to: { name: "Granni, Iceland", lat: 64.2098, lng: -19.6830 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Granni, Iceland", lat: 64.2098, lng: -19.6830 },
                        to: { name: "Seljalandsfoss, Iceland", lat: 63.6156, lng: -19.9886 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Seljalandsfoss, Iceland", lat: 63.6156, lng: -19.9886 },
                        to: { name: "Gljúfrabúi, Iceland", lat: 63.6209, lng: -19.9864 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Gljúfrabúi, Iceland", lat: 63.6209, lng: -19.9864 },
                        to: { name: "Skógafoss, Iceland", lat: 63.5321, lng: -19.5114 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Skógafoss, Iceland", lat: 63.5321, lng: -19.5114 },
                        to: { name: "Dyrhólaey Viewpoint, Iceland", lat: 63.4015, lng: -19.1284 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Dyrhólaey Viewpoint, Iceland", lat: 63.4015, lng: -19.1284 },
                        to: { name: "Reynisfjara Beach, Iceland", lat: 63.4057, lng: -19.0716 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Reynisfjara Beach, Iceland", lat: 63.4057, lng: -19.0716 },
                        to: { name: "Víkurfjara Black Sand Beach, Iceland", lat: 63.4143, lng: -19.0104 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Víkurfjara Black Sand Beach, Iceland", lat: 63.4143, lng: -19.0104 },
                        to: { name: "Skaftafell tjaldsvæði, Iceland", lat: 64.0155, lng: -16.9716 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Skaftafell tjaldsvæði, Iceland", lat: 64.0155, lng: -16.9716 },
                        to: { name: "Svartifoss, Iceland", lat: 64.0275, lng: -16.9753 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },
                    {
                        from: { name: "Svartifoss, Iceland", lat: 64.0275, lng: -16.9753 },
                        to: { name: "Jökulsárlón, Iceland", lat: 64.0484, lng: -16.1791 },
                        transport: "car",
                        color: transportColors.car,
                        description: "Road tripping..."
                    },

                ]
            },
            // ... more trips
        ];

        // Apply the transport color mapping to all segments once more to ensure consistency
        tripRoutes.forEach(trip => {
            trip.segments.forEach(segment => {
                // Force the color to match the transport type
                segment.color = transportColors[segment.transport] || "#000000";
            });
        });

        return NextResponse.json(tripRoutes);
    } catch (error) {
        console.error('Error fetching trip routes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch trip routes' },
            { status: 500 }
        );
    }
}