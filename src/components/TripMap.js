import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons
const fixLeafletIcon = () => {
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
};

const TripMap = ({ trip }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        // Fix Leaflet icon issue
        fixLeafletIcon();

        // Initialize map if it doesn't exist yet
        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current).setView([0, 0], 2);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstanceRef.current);
        }

        // Clear existing layers
        mapInstanceRef.current.eachLayer(layer => {
            if (layer instanceof L.Polyline || layer instanceof L.Marker) {
                mapInstanceRef.current.removeLayer(layer);
            }
        });

        if (!trip || !trip.segments || trip.segments.length === 0) {
            return;
        }

        // Collect all coordinates to set bounds
        const bounds = L.latLngBounds();

        // Process segments and add to map
        trip.segments.forEach((segment, index) => {
            // Create polyline for the segment
            const from = [segment.from.lat, segment.from.lng];
            const to = [segment.to.lat, segment.to.lng];

            // Add points to bounds
            bounds.extend(from);
            bounds.extend(to);

            // Create polyline
            const polyline = L.polyline([from, to], {
                color: segment.color || '#000',
                weight: 3,
                opacity: 0.7
            }).addTo(mapInstanceRef.current);

            // Add tooltip with description
            polyline.bindTooltip(`
        <strong>${segment.from.name} to ${segment.to.name}</strong><br>
        ${segment.transport.charAt(0).toUpperCase() + segment.transport.slice(1)}: ${segment.description}
      `);

            // Add markers for locations (only if not already added)
            const fromMarker = L.marker(from).addTo(mapInstanceRef.current);
            fromMarker.bindPopup(`<strong>${segment.from.name}</strong>`);

            // Add ending marker only for the last segment
            if (index === trip.segments.length - 1) {
                const toMarker = L.marker(to).addTo(mapInstanceRef.current);
                toMarker.bindPopup(`<strong>${segment.to.name}</strong>`);
            }
        });

        // Fit map to bounds with padding
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });

        // Force a resize event after render to ensure the map fills its container
        setTimeout(() => {
            mapInstanceRef.current.invalidateSize();
        }, 100);

        // Cleanup on unmount
        return () => {
            if (mapInstanceRef.current) {
                // Just clean layers, don't remove the map instance
                mapInstanceRef.current.eachLayer(layer => {
                    if (layer instanceof L.Polyline || layer instanceof L.Marker) {
                        mapInstanceRef.current.removeLayer(layer);
                    }
                });
            }
        };
    }, [trip]);

    return <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>;
};

export default TripMap;