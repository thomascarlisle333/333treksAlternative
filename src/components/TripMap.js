'use client';

import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon.src,
    shadowUrl: iconShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Transport type to icon mapping (using emoji for simplicity)
const transportIcons = {
    "train": "🚆",
    "plane": "✈️",
    "car": "🚗",
    "bus": "🚌",
    "boat": "⛴️",
    "bicycle": "🚲",
    "walking": "🚶"
};

const TripMap = ({ selectedTrip }) => {
    if (!selectedTrip) return null;

    // Calculate bounds to fit all markers for the selected trip
    const getBounds = () => {
        if (!selectedTrip || selectedTrip.segments.length === 0) return null;

        const points = [];
        // Add starting point
        points.push([selectedTrip.segments[0].from.lat, selectedTrip.segments[0].from.lng]);

        // Add all destination points
        selectedTrip.segments.forEach(segment => {
            points.push([segment.to.lat, segment.to.lng]);
        });

        return L.latLngBounds(points);
    };

    const bounds = getBounds();

    if (!bounds) return <div>No map data available</div>;

    return (
        <MapContainer
            bounds={bounds}
            style={{ height: '100%', width: '100%' }}
            zoom={5}
            boundsOptions={{ padding: [50, 50] }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Starting point marker */}
            <Marker
                position={[selectedTrip.segments[0].from.lat, selectedTrip.segments[0].from.lng]}
            >
                <Popup>
                    <div>
                        <h3 className="font-bold">{selectedTrip.segments[0].from.name}</h3>
                        <p>Starting point of the journey</p>
                    </div>
                </Popup>
                <Tooltip permanent>{selectedTrip.segments[0].from.name}</Tooltip>
            </Marker>

            {/* Draw lines for each segment and add markers for destinations */}
            {selectedTrip.segments.map((segment, index) => (
                <React.Fragment key={index}>
                    <Polyline
                        positions={[
                            [segment.from.lat, segment.from.lng],
                            [segment.to.lat, segment.to.lng]
                        ]}
                        color={segment.color}
                        weight={4}
                    >
                        <Tooltip>
                            {transportIcons[segment.transport] || ''} {segment.description}
                        </Tooltip>
                    </Polyline>

                    <Marker
                        position={[segment.to.lat, segment.to.lng]}
                    >
                        <Popup>
                            <div>
                                <h3 className="font-bold">{segment.to.name}</h3>
                                <p>{segment.description}</p>
                            </div>
                        </Popup>
                        <Tooltip permanent>{segment.to.name}</Tooltip>
                    </Marker>
                </React.Fragment>
            ))}
        </MapContainer>
    );
};

export default TripMap;