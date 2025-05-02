'use client';

import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
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

// Component to handle zoom level changes and control label visibility
function ZoomHandler({ setShowLabels }) {
    const map = useMapEvents({
        zoomend: () => {
            const currentZoom = map.getZoom();
            // Only show labels when zoomed in past level 7 (adjust this threshold as needed)
            setShowLabels(currentZoom > 7);
        },
    });

    // Set initial label visibility based on starting zoom
    useEffect(() => {
        setShowLabels(map.getZoom() > 7);
    }, [map, setShowLabels]);

    return null;
}

// Component to set bounds only when trip changes, not on zoom
function TripBoundsSetter({ bounds, tripId }) {
    const map = useMap();
    const prevTripIdRef = useRef(null); // Start with null to ensure first trip is framed

    useEffect(() => {
        // Always frame on first load (when prevTripIdRef.current is null)
        // OR when the trip ID changes
        if (bounds && (prevTripIdRef.current === null || tripId !== prevTripIdRef.current)) {
            map.fitBounds(bounds, { padding: [50, 50] });
            prevTripIdRef.current = tripId;
        }
    }, [map, bounds, tripId]);

    return null;
}

const TripMap = ({ selectedTrip }) => {
    const [showLabels, setShowLabels] = useState(false);
    const prevTripRef = useRef(null);

    if (!selectedTrip) return null;

    // Extract trip ID to detect when trip changes
    const tripId = selectedTrip.id;

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
            style={{ height: '100%', width: '100%' }}
            zoom={5}
            minZoom={2} // Prevent zooming out too far
            worldCopyJump={true} // Better handling of world wrapping
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Zoom handler component to control label visibility */}
            <ZoomHandler setShowLabels={setShowLabels} />

            {/* Set bounds on initial render AND when the selected trip changes */}
            <TripBoundsSetter bounds={bounds} tripId={tripId} />

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
                {showLabels && (
                    <Tooltip permanent>{selectedTrip.segments[0].from.name}</Tooltip>
                )}
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
                        {showLabels && (
                            <Tooltip permanent>{segment.to.name}</Tooltip>
                        )}
                    </Marker>
                </React.Fragment>
            ))}
        </MapContainer>
    );
};

export default TripMap;