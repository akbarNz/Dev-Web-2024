import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_ID } from '../config/maps';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const containerStyle = {
    width: '100%',
    height: '400px'
};

const libraries = ['marker'];

const createMarkerContent = (IconComponent, color) => {
    // Get the path from the icon component
    const path = IconComponent?.mui?.icon?.path || IconComponent?.default?.path;
    if (!path) return null;

    const svg = `
        <svg viewBox="0 0 24 24" width="30" height="30">
            <path d="${path}" fill="${color}"/>
        </svg>
    `;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = document.createElement('img');
    img.style.width = '30px';
    img.style.height = '30px';
    img.src = url;

    // Clean up the blob URL when the image loads
    img.onload = () => URL.revokeObjectURL(url);
    
    return img;
};

const Map = ({ center, searchParams, studios }) => {
    const [selectedStudio, setSelectedStudio] = useState(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [markers, setMarkers] = useState([]);

    const handleMapLoad = useCallback((map) => {
        setMapInstance(map);
    }, []);

    const createAdvancedMarker = useCallback((position, content, title, onClick) => {
        if (!window.google?.maps?.marker) return null;

        const marker = new window.google.maps.marker.AdvancedMarkerElement({
            position,
            content,
            title,
            map: mapInstance
        });

        if (onClick) {
            marker?.addListener('gmp-click', onClick);
        }

        return marker;
    }, [mapInstance]);

    useEffect(() => {
        if (!mapInstance || !window.google?.maps?.marker) return;

        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));

        // Create user location marker
        const userMarker = createAdvancedMarker(
            center,
            createMarkerContent(LocationOnIcon, '#2196F3'),
            'Your location'
        );

        // Create studio markers
        const studioMarkers = studios?.map(studio => {
            const marker = createAdvancedMarker(
                {
                    lat: Number(studio.latitude),
                    lng: Number(studio.longitude)
                },
                createMarkerContent(MusicNoteIcon, '#FF4081'),
                studio.nom,
                () => setSelectedStudio(studio)  // Pass the click handler here
            );

            return marker;
        });

        const newMarkers = [userMarker, ...(studioMarkers || [])].filter(Boolean);
        setMarkers(newMarkers);

        // Cleanup function
        return () => {
            newMarkers.forEach(marker => marker?.setMap(null));
        };
    }, [mapInstance, studios, center, createAdvancedMarker]);

    return (
        <LoadScript 
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            libraries={libraries}
        >
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={13}
                options={{
                    mapId: GOOGLE_MAPS_ID, // Ensure Map ID is passed here
                    disableDefaultUI: false
                }}
                onLoad={handleMapLoad}
            >
                {selectedStudio && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -100%)',
                            backgroundColor: 'white',
                            padding: '12px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                            zIndex: 1000
                        }}
                    >
                        <h3>{selectedStudio.nom}</h3>
                        <p>{selectedStudio.adresse}</p>
                        <p>€{selectedStudio.prix_par_heure}/hour</p>
                        <button 
                            onClick={() => setSelectedStudio(null)}
                            style={{ float: 'right' }}
                        >
                            Close
                        </button>
                    </div>
                )}
            </GoogleMap>
        </LoadScript>
    );
};

export default React.memo(Map);