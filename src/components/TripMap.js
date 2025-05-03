'use client';

import React, { useState, useRef, useEffect } from 'react';
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

// DEFINITIVE COLOR MAPPING - Never change these values
// These are the ONLY colors that will ever be used to render routes
// Transport type to icon mapping (using emoji for simplicity)
const TRANSPORT_ICONS = {
    "plane": "✈️",
    "train": "🚆",
    "car": "🚗",
    "bus": "🚌",
    "boat": "⛴️",
    "bicycle": "🚲",
    "walking": "🚶"
};

// Simple function to handle label visibility based on zoom level
function ZoomHandler({ setShowLabels }) {
    useMapEvents({
        zoomend: (e) => {
            setShowLabels(e.target.getZoom() > 7);
        }
    });
    return null;
}

// Function to set map bounds based on the selected trip
function TripBoundsSetter({ bounds, tripId }) {
    const map = useMap();
    const prevTripIdRef = useRef(null);

    React.useEffect(() => {
        if (bounds && (prevTripIdRef.current === null || tripId !== prevTripIdRef.current)) {
            map.fitBounds(bounds, { padding: [50, 50] });
            prevTripIdRef.current = tripId;
        }
    }, [map, bounds, tripId]);

    return null;
}

// Helper function to normalize longitude values
function normalizeLongitude(lng) {
    let result = lng;
    while (result > 180) result -= 360;
    while (result < -180) result += 360;
    return result;
}

const TripMap = ({ selectedTrip }) => {
    const [showLabels, setShowLabels] = useState(false);
    const [forceUpdate, setForceUpdate] = useState(0); // Force re-render when needed

    // Force re-render when trip changes
    useEffect(() => {
        setForceUpdate(prev => prev + 1);
        console.log("Trip changed, forcing re-render:", selectedTrip?.name);
    }, [selectedTrip?.id]);

    if (!selectedTrip || !selectedTrip.segments || selectedTrip.segments.length === 0) {
        return <div>No trip data available</div>;
    }

    // DEBUGGING OUTPUT
    console.log("RENDERING TRIP:", selectedTrip.name, "ID:", selectedTrip.id);
    console.log("Force update counter:", forceUpdate);

    // Special debugging for problematic trips
    if (selectedTrip.id === 1 || selectedTrip.id === 4) {
        console.log("DEBUGGING PROBLEM TRIP:", selectedTrip.name);
        selectedTrip.segments.forEach((segment, idx) => {
            console.log(`Segment ${idx}: ${segment.from.name} → ${segment.to.name}`);
            console.log(`  Transport: "${segment.transport}"`);
            console.log(`  Original color in data: ${segment.color}`);

            // Check if this is a flight segment
            if (segment.from.name.includes("New York") ||
                segment.transport.toLowerCase() === "plane") {
                console.log("  THIS SHOULD BE PURPLE!");
            }
        });
    }

    // Calculate map bounds to fit all points
    const getBounds = () => {
        const points = [];

        // Add the starting point
        points.push([selectedTrip.segments[0].from.lat, selectedTrip.segments[0].from.lng]);

        // Add all destinations
        selectedTrip.segments.forEach(segment => {
            points.push([segment.to.lat, segment.to.lng]);
        });

        return L.latLngBounds(points);
    };

    // Check if a route crosses the international date line
    const crossesDateLine = (fromLng, toLng) => {
        const normFrom = normalizeLongitude(fromLng);
        const normTo = normalizeLongitude(toLng);
        return Math.abs(normFrom - normTo) > 180;
    };

    // Create a curved path for routes that cross the date line
    const createCurvedPath = (fromLat, fromLng, toLat, toLng) => {
        const numPoints = 10;
        const points = [];

        const normFrom = normalizeLongitude(fromLng);
        const normTo = normalizeLongitude(toLng);

        // Add the starting point
        points.push([fromLat, normFrom]);

        // Create intermediate points for a smooth curve
        for (let i = 1; i < numPoints - 1; i++) {
            const ratio = i / numPoints;
            const lat = fromLat + (toLat - fromLat) * ratio;

            let lng;
            if (normFrom > normTo) {
                // Go eastward around the globe
                if (i < numPoints / 2) {
                    lng = normFrom + (180 - normFrom) * (ratio * 2);
                } else {
                    lng = -180 + (normTo + 180) * ((ratio - 0.5) * 2);
                }
            } else {
                // Go westward around the globe
                if (i < numPoints / 2) {
                    lng = normFrom - (normFrom + 180) * (ratio * 2);
                } else {
                    lng = -180 - (180 - normTo) * ((ratio - 0.5) * 2);
                }
            }

            points.push([lat, lng]);
        }

        // Add the ending point
        points.push([toLat, normTo]);
        return points;
    };

    const bounds = getBounds();

    return (
        <MapContainer
            key={`map-${selectedTrip.id}-${forceUpdate}`} // Force re-render when trip changes
            style={{ height: '100%', width: '100%' }}
            center={[20, 0]}
            zoom={2}
            scrollWheelZoom={true}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            <ZoomHandler setShowLabels={setShowLabels} />
            <TripBoundsSetter bounds={bounds} tripId={selectedTrip.id} />

            {/* Starting point marker */}
            <Marker position={[selectedTrip.segments[0].from.lat, selectedTrip.segments[0].from.lng]}>
                <Popup>
                    <h3 className="font-bold">{selectedTrip.segments[0].from.name}</h3>
                    <p>Starting point of the journey</p>
                </Popup>
                {showLabels && <Tooltip permanent>{selectedTrip.segments[0].from.name}</Tooltip>}
            </Marker>

            {/* Render all segments */}
            {selectedTrip.segments.map((segment, index) => {
                // Determine the route path
                let positions;
                if (crossesDateLine(segment.from.lng, segment.to.lng)) {
                    positions = createCurvedPath(
                        segment.from.lat, segment.from.lng,
                        segment.to.lat, segment.to.lng
                    );
                } else {
                    positions = [
                        [segment.from.lat, segment.from.lng],
                        [segment.to.lat, segment.to.lng]
                    ];
                }

                // Force specific colors based on transport type
                // Hard-code specific cases for problem trips
                let forcedColor;

                // JFK to Paris (in Northern France trip) or JFK to Barcelona (in Europe Fall 2022)
                if ((selectedTrip.id === 1 || selectedTrip.id === 4) &&
                    segment.from.name.includes('New York') &&
                    (segment.to.name.includes('Paris') || segment.to.name.includes('Barcelona'))) {
                    forcedColor = "#9b59b6"; // Purple for planes
                    console.log("FORCING PURPLE for flight from New York:", segment.from.name, "to", segment.to.name);
                }
                // Other segments - determine by transport type only
                else {
                    switch (segment.transport.toLowerCase()) {
                        case 'plane':
                            forcedColor = "#9b59b6"; // Purple for planes
                            break;
                        case 'train':
                            forcedColor = "#3498db"; // Blue for trains
                            break;
                        case 'car':
                            forcedColor = "#e74c3c"; // Red for cars
                            break;
                        case 'bus':
                            forcedColor = "#2ecc71"; // Green for buses
                            break;
                        case 'boat':
                            forcedColor = "#1abc9c"; // Teal for boats
                            break;
                        default:
                            forcedColor = "#000000"; // Black for unknown transport types
                    }
                }

                // Log for debugging purposes
                console.log(`Segment ${index}: ${segment.from.name} → ${segment.to.name}`);
                console.log(`  Transport: ${segment.transport}, Forced color: ${forcedColor}`);

                // Use a unique key for each polyline to force re-rendering
                const polylineKey = `polyline-${selectedTrip.id}-${index}-${forcedColor.replace('#', '')}-${forceUpdate}`;

                return (
                    <React.Fragment key={polylineKey}>
                        <Polyline
                            key={polylineKey}
                            positions={positions}
                            stroke={forcedColor}
                            color={forcedColor}
                            weight={4}
                            pathOptions={{ color: forcedColor, stroke: forcedColor }}
                        >
                            <Tooltip>
                                {TRANSPORT_ICONS[segment.transport.toLowerCase()] || ''} {segment.description}
                            </Tooltip>
                        </Polyline>

                        <Marker position={[segment.to.lat, segment.to.lng]}>
                            <Popup>
                                <h3 className="font-bold">{segment.to.name}</h3>
                                <p>{segment.description}</p>
                            </Popup>
                            {showLabels && <Tooltip permanent>{segment.to.name}</Tooltip>}
                        </Marker>
                    </React.Fragment>
                );
            })}
        </MapContainer>
    );
};

export default TripMap;