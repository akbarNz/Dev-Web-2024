import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { findNearbyStudios } from '../../services/studioService';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_ID, defaultMapConfig } from '../config/maps';

const containerStyle = {
    width: '100%',
    height: '400px'
};

const Map = ({ center, searchParams, onStudiosFound }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        const fetchStudios = async () => {
            try {
                const studios = await findNearbyStudios(
                    searchParams.criteria,
                    searchParams.value,
                    center
                );
                setMarkers([
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
                ]);
                onStudiosFound(studios);
            } catch (err) {
                setError('Failed to fetch studios');
            } finally {
                setLoading(false);
            }
        };

        if (center && searchParams) {
            fetchStudios();
        }
    }, [center, searchParams, onStudiosFound]);

    const onLoad = (map) => {
        const { google } = window;
        if (google) {
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
    };

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
            libraries={['marker']}
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

export default Map;