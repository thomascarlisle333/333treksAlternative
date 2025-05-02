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

// Component to configure the map for continuous world wrapping
function WorldWrapConfigurer() {
    const map = useMap();

    useEffect(() => {
        // Disable the clamping of latitude and longitude
        map.setMaxBounds([[-90, -Infinity], [90, Infinity]]);

        // Add event listener to handle world wrapping
        map.on('drag', () => {
            const center = map.getCenter();
            if (center.lng < -180) {
                map.panTo([center.lat, center.lng + 360]);
            } else if (center.lng > 180) {
                map.panTo([center.lat, center.lng - 360]);
            }
        });

    }, [map]);

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

    // Function to check if a segment is a long-distance international flight
    const isLongDistanceInternationalFlight = (segment) => {
        // Check if it's a plane AND if the segment spans more than, say, 50 degrees of longitude
        return segment.transport === 'plane' &&
            Math.abs(segment.from.lng - segment.to.lng) > 50;
    };

    // Improved function to identify transpacific routes
    const isTranspacificRoute = (segment) => {
        if (segment.transport !== 'plane') return false;

        // Normalize longitudes to -180 to 180 range
        const fromLng = normalizeToStandardLongitude(segment.from.lng);
        const toLng = normalizeToStandardLongitude(segment.to.lng);

        // Calculate the longitude difference both ways around the globe
        const directDiff = Math.abs(fromLng - toLng);
        const wrapDiff = 360 - directDiff;

        // If the wrapped difference is smaller, it's likely a transpacific route
        // Additionally check if one point is in western hemisphere and one in eastern
        const isTranshemispheric = (fromLng < 0 && toLng > 0) || (fromLng > 0 && toLng < 0);

        return (wrapDiff < directDiff) ||
            (isTranshemispheric && directDiff > 120) || // Large hemisphere crossing
            (segment.description && segment.description.toLowerCase().includes('transpacific'));
    };

    // Helper function to normalize longitude to -180 to 180 range
    const normalizeToStandardLongitude = (lng) => {
        let normalized = lng;
        while (normalized > 180) normalized -= 360;
        while (normalized < -180) normalized += 360;
        return normalized;
    };

    // Completely rewritten function to create better transpacific routes
    const createTranspacificRoutePoints = (fromLat, fromLng, toLat, toLng) => {
        const points = [];
        const numPoints = 20; // Number of points to create for the curve

        // Normalize longitudes to standard range
        const normFromLng = normalizeToStandardLongitude(fromLng);
        const normToLng = normalizeToStandardLongitude(toLng);

        // Determine if going eastward or westward across the Pacific
        // This is based on which direction is shorter around the globe
        const directDiff = Math.abs(normFromLng - normToLng);
        const wrapDiff = 360 - directDiff;

        // Determine if we should go eastward or westward
        const goEastward = (normFromLng < normToLng && directDiff < wrapDiff) ||
            (normFromLng > normToLng && directDiff > wrapDiff);

        // For routes between East Asia and North America specifically, choose the Pacific crossing
        const isFromAsia = normFromLng > 100 && normFromLng < 180;
        const isToAmerica = normToLng < -30 && normToLng > -180;
        const isFromAmerica = normFromLng < -30 && normFromLng > -180;
        const isToAsia = normToLng > 100 && normToLng < 180;

        const isAsiaAmericaRoute = (isFromAsia && isToAmerica) || (isFromAmerica && isToAsia);

        // Starting point
        points.push([fromLat, normFromLng]);

        // Generate intermediate points for a curved path across the Pacific
        for (let i = 1; i < numPoints - 1; i++) {
            const ratio = i / numPoints;
            let intermediateLng;

            if (isAsiaAmericaRoute) {
                // Forced Pacific crossing for Asia-America routes
                if (isFromAsia && isToAmerica) {
                    // Asia to America - eastward across the Pacific
                    if (i < numPoints / 2) {
                        intermediateLng = normFromLng + (180 - normFromLng) * (ratio * 2);
                    } else {
                        intermediateLng = -180 + (normToLng + 180) * ((ratio - 0.5) * 2);
                    }
                } else {
                    // America to Asia - westward across the Pacific
                    if (i < numPoints / 2) {
                        intermediateLng = normFromLng - (normFromLng + 180) * (ratio * 2);
                    } else {
                        intermediateLng = -180 + (normToLng + 180) * ((ratio - 0.5) * 2);
                    }
                }
            } else if (goEastward) {
                // Eastward route (increasing longitude)
                if (directDiff < wrapDiff) {
                    // Direct eastward route
                    intermediateLng = normFromLng + (normToLng - normFromLng) * ratio;
                } else {
                    // Eastward route crossing the date line
                    if (i < numPoints / 2) {
                        intermediateLng = normFromLng + (180 - normFromLng) * (ratio * 2);
                    } else {
                        intermediateLng = -180 + (normToLng + 180) * ((ratio - 0.5) * 2);
                    }
                }
            } else {
                // Westward route (decreasing longitude)
                if (directDiff < wrapDiff) {
                    // Direct westward route
                    intermediateLng = normFromLng + (normToLng - normFromLng) * ratio;
                } else {
                    // Westward route crossing the date line
                    if (i < numPoints / 2) {
                        intermediateLng = normFromLng - (normFromLng + 180) * (ratio * 2);
                    } else {
                        intermediateLng = -180 - (180 - normToLng) * ((ratio - 0.5) * 2);
                    }
                }
            }

            // For latitude, create a curved path that goes a bit north
            // (typical for great circle routes)
            const latCurveOffset = Math.sin(ratio * Math.PI) * 15; // 15 degrees latitude curve
            const intermediateLat = fromLat + (toLat - fromLat) * ratio + latCurveOffset;

            points.push([intermediateLat, intermediateLng]);
        }

        // Ending point
        points.push([toLat, normToLng]);

        return points;
    };

    // We won't need this function anymore as we'll handle everything in createTranspacificRoutePoints
    const crossesDateLine = (fromLng, toLng) => {
        // Check if the segment spans more than 180 degrees of longitude
        // but we'll only use this for non-plane routes
        const normFromLng = normalizeToStandardLongitude(fromLng);
        const normToLng = normalizeToStandardLongitude(toLng);
        const directDiff = Math.abs(normFromLng - normToLng);
        return directDiff > 180;
    };

    // This is also simplified since we handle most cases in createTranspacificRoutePoints
    const createDateLineCrossingPolyline = (fromLat, fromLng, toLat, toLng) => {
        const normFromLng = normalizeToStandardLongitude(fromLng);
        const normToLng = normalizeToStandardLongitude(toLng);

        // We'll handle this more simply now
        const directDiff = Math.abs(normFromLng - normToLng);
        const wrapDiff = 360 - directDiff;

        // If it's truly more efficient to cross the date line
        if (wrapDiff < directDiff) {
            const points = [];
            const numPoints = 10;

            // Determine which direction to go
            const goEastward = (normFromLng < normToLng && directDiff > wrapDiff) ||
                (normFromLng > normToLng && directDiff < wrapDiff);

            points.push([fromLat, normFromLng]);

            for (let i = 1; i < numPoints - 1; i++) {
                const ratio = i / numPoints;
                let intermediateLng;

                if (goEastward) {
                    // Eastward crossing
                    if (i < numPoints / 2) {
                        intermediateLng = normFromLng + (180 - normFromLng) * (ratio * 2);
                    } else {
                        intermediateLng = -180 + (normToLng + 180) * ((ratio - 0.5) * 2);
                    }
                } else {
                    // Westward crossing
                    if (i < numPoints / 2) {
                        intermediateLng = normFromLng - (normFromLng + 180) * (ratio * 2);
                    } else {
                        intermediateLng = -180 - (180 - normToLng) * ((ratio - 0.5) * 2);
                    }
                }

                // Simple linear interpolation for latitude
                const intermediateLat = fromLat + (toLat - fromLat) * ratio;

                points.push([intermediateLat, intermediateLng]);
            }

            points.push([toLat, normToLng]);
            return points;
        } else {
            // Just use a direct line if crossing the date line is not more efficient
            return [
                [fromLat, normFromLng],
                [toLat, normToLng]
            ];
        }
    };

    const bounds = getBounds();

    if (!bounds) return <div>No map data available</div>;

    return (
        <MapContainer
            style={{ height: '100%', width: '100%' }}
            zoom={2}
            minZoom={1} // Allow further zooming out
            worldCopyJump={true} // Better handling of world wrapping
            center={[30, -45]} // Center somewhere in the Atlantic for a better global view
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                noWrap={false} // Allow the map to repeat horizontally
            />

            {/* Add the world wrap configurer */}
            <WorldWrapConfigurer />

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
            {selectedTrip.segments.map((segment, index) => {
                let positions;

                // Use transpacific route handling for plane segments that cross the Pacific
                if (segment.transport === 'plane' && isTranspacificRoute(segment)) {
                    positions = createTranspacificRoutePoints(
                        segment.from.lat,
                        segment.from.lng,
                        segment.to.lat,
                        segment.to.lng
                    );
                }
                // Use date line crossing for non-plane routes that cross the date line
                else if (segment.transport !== 'plane' && crossesDateLine(segment.from.lng, segment.to.lng)) {
                    positions = createDateLineCrossingPolyline(
                        segment.from.lat,
                        segment.from.lng,
                        segment.to.lat,
                        segment.to.lng
                    );
                }
                // Regular straight-line routes for everything else
                else {
                    positions = [
                        [segment.from.lat, segment.from.lng],
                        [segment.to.lat, segment.to.lng]
                    ];
                }

                return (
                    <React.Fragment key={index}>
                        <Polyline
                            positions={positions}
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
                );
            })}
        </MapContainer>
    );
};

export default TripMap;