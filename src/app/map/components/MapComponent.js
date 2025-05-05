'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// This component handles updating the map center and zoom when locations change
function MapUpdater({ center, zoom }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);

    return null;
}

// This component is only rendered on the client side
export default function MapComponent({ locations }) {
    const [isMapReady, setIsMapReady] = useState(false);
    const [visibleMarkers, setVisibleMarkers] = useState([]);

    // Only create icon definition once
    const customIcon = useMemo(() => new L.Icon({
        iconUrl: '/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    }), []);

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

        // Progressive marker loading for better performance
        if (locations && locations.length > 0) {
            // First load a subset of markers (first 20) for faster initial rendering
            setVisibleMarkers(locations.slice(0, 20));

            // Then load the rest after a short delay
            if (locations.length > 20) {
                const timer = setTimeout(() => {
                    setVisibleMarkers(locations);
                }, 1000);

                return () => clearTimeout(timer);
            }
        }
    }, [locations]);

    // Group locations by country - memoized for performance
    const groupedLocations = useMemo(() => {
        if (!locations || locations.length === 0) return {};

        return locations.reduce((groups, location) => {
            if (!groups[location.country]) {
                groups[location.country] = [];
            }
            groups[location.country].push(location);
            return groups;
        }, {});
    }, [locations]);

    // Calculate center of the map based on all locations - memoized
    const mapCenter = useMemo(() => {
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
    }, [locations]);

    // Determine appropriate zoom level - memoized
    const mapZoom = useMemo(() => {
        if (!locations || locations.length === 0) return 2;

        // More precise zoom calculation based on number of countries
        const countryCount = Object.keys(groupedLocations).length;

        if (countryCount === 1) return 5; // Single country - zoom closer
        if (countryCount <= 3) return 4; // Few countries
        if (countryCount <= 6) return 3; // Several countries
        return 2; // Many countries
    }, [locations, groupedLocations]);

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
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: '100%', width: '100%' }}
                attributionControl={false}
                zoomControl={true}
                doubleClickZoom={true}
                scrollWheelZoom={true}
                dragging={true}
                easeLinearity={0.35}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    tileSize={256}
                    maxZoom={19}
                    detectRetina={true}
                />

                <MapUpdater center={mapCenter} zoom={mapZoom} />

                {visibleMarkers.map((location) => (
                    <Marker
                        key={`${location.country}-${location.city}`}
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