'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// This component is only rendered on the client side
export default function MapComponent({ locations }) {
    const [isMapReady, setIsMapReady] = useState(false);

    // Fix Leaflet icon issues on client-side only
    useEffect(() => {
        // Fix Leaflet icon issues
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/marker-icon-2x.png',
            iconUrl: '/marker-icon.png',
            shadowUrl: '/marker-shadow.png',
        });

        setIsMapReady(true);
    }, []);

    const customIcon = new L.Icon({
        iconUrl: '/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    // Group locations by country for better UX with many markers
    const groupedLocations = locations.reduce((groups, location) => {
        if (!groups[location.country]) {
            groups[location.country] = [];
        }
        groups[location.country].push(location);
        return groups;
    }, {});

    // Calculate center of the map based on all locations
    const calculateMapCenter = () => {
        if (!locations || locations.length === 0) {
            return [20, 0]; // Default center
        }

        // Filter out default locations (they might skew the center)
        const validLocations = locations.filter(loc => !loc.isDefaultLocation);

        if (validLocations.length === 0) {
            return [20, 0]; // Default center if no valid locations
        }

        // Calculate average lat/long for real GPS locations
        const totalLat = validLocations.reduce((sum, loc) => sum + loc.latitude, 0);
        const totalLng = validLocations.reduce((sum, loc) => sum + loc.longitude, 0);

        return [totalLat / validLocations.length, totalLng / validLocations.length];
    };

    // Determine appropriate zoom level
    const calculateZoom = () => {
        if (!locations || locations.length === 0) return 2;

        // More precise zoom calculation could be implemented here
        // For now, simple heuristic based on number of countries
        const countryCount = Object.keys(groupedLocations).length;

        if (countryCount === 1) return 5; // Single country - zoom closer
        if (countryCount <= 3) return 4; // Few countries
        if (countryCount <= 6) return 3; // Several countries
        return 2; // Many countries
    };

    if (!isMapReady) {
        return (
            <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg mb-8 flex items-center justify-center bg-gray-100">
                <p className="text-xl">Initializing map...</p>
            </div>
        );
    }

    return (
        <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg mb-8">
            <MapContainer
                center={calculateMapCenter()}
                zoom={calculateZoom()}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {locations.map((location, index) => (
                    <Marker
                        key={`${location.country}-${location.city}-${index}`}
                        position={[location.latitude, location.longitude]}
                        icon={customIcon}
                    >
                        <Popup>
                            <div className="text-center">
                                <h3 className="font-bold">{location.city}, {location.country}</h3>
                                <p className="my-2">{location.photoCount} photos</p>
                                <Link
                                    href={`/gallery/${encodeURIComponent(location.country)}/${encodeURIComponent(location.city)}`}
                                    className="inline-block px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transform transition-all duration-300 hover:scale-105"
                                >
                                    View Photos
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}