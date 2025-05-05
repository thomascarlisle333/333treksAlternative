'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// This component is only rendered on the client side
export default function MapComponent({ locations }) {
    // Custom icon for the markers
    useEffect(() => {
        // Fix Leaflet icon issues
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: '/marker-icon-2x.png',
            iconUrl: '/marker-icon.png',
            shadowUrl: '/marker-shadow.png',
        });
    }, []);

    const customIcon = new L.Icon({
        iconUrl: '/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    return (
        <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg mb-8">
            <MapContainer
                center={[20, 0]} // Default center of the map (adjust as needed)
                zoom={2} // Default zoom level
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {locations.map((location, index) => (
                    <Marker
                        key={index}
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