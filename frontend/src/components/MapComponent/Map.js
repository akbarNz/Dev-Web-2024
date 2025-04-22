import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { findNearbyStudios } from '../../services/studioService';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_ID, defaultMapConfig } from '../config/maps';

// Move these outside component to prevent recreating on each render
const containerStyle = {
    width: '100%',
    height: '400px'
};

// Define libraries as a static array outside component
const libraries = ['marker'];

const Map = ({ center, searchParams, onStudiosFound }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [markers, setMarkers] = useState([]);
    
    // Memoize search parameters to prevent unnecessary re-renders
    const searchKey = useMemo(() => 
        `${searchParams?.criteria}-${searchParams?.value}-${center?.lat}-${center?.lng}`,
        [searchParams, center]
    );
    
    useEffect(() => {
        let isMounted = true;

        const fetchStudios = async () => {
            if (!center || !searchParams) return;
            
            try {
                setLoading(true);
                const studios = await findNearbyStudios(
                    searchParams.criteria,
                    searchParams.value,
                    center
                );
                
                if (!isMounted) return;
                
                const newMarkers = [
                    {
                        position: center,
                        icon: '/user-location.png',
                        title: 'Your location'
                    },
                    ...studios.map(studio => ({
                        position: { 
                            lat: studio.latitude, 
                            lng: studio.longitude 
                        },
                        title: studio.name
                    }))
                ];
                
                setMarkers(newMarkers);
                onStudiosFound(studios);
            } catch (err) {
                if (isMounted) {
                    setError('Failed to fetch studios');
                    console.error('Error fetching studios:', err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchStudios();

        return () => {
            isMounted = false;
        };
    }, [searchKey]); // Only re-run when searchKey changes

    const onLoad = useCallback((map) => {
        const { google } = window;
        if (google && markers.length > 0) {
            markers.forEach(marker => {
                new google.maps.marker.AdvancedMarkerElement({
                    position: marker.position,
                    map: map,
                    title: marker.title,
                    ...(marker.icon && {
                        content: createMarkerContent(marker.icon)
                    })
                });
            });
        }
    }, [markers]);

    const createMarkerContent = (iconUrl) => {
        const element = document.createElement('div');
        element.className = 'custom-marker';
        element.style.backgroundImage = `url(${iconUrl})`;
        element.style.width = '40px';
        element.style.height = '40px';
        element.style.backgroundSize = 'contain';
        return element;
    };

    return (
        <LoadScript 
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            libraries={libraries}
        >
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center || defaultMapConfig.center}
                zoom={defaultMapConfig.zoom}
                onLoad={onLoad}
                mapId={GOOGLE_MAPS_ID}
                options={{
                    mapId: GOOGLE_MAPS_ID
                }}
            >
            </GoogleMap>
        </LoadScript>
    );
};

// Wrap with memo to prevent unnecessary re-renders
export default React.memo(Map);