import React from 'react';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_ID, defaultMapConfig } from '../config/maps';

const containerStyle = {
    width: '100%',
    height: '400px'
};

const Map = ({ center, zoom = defaultMapConfig.zoom }) => {
    const onLoad = (map) => {
        if (center) {
            const { google } = window;
            if (google) {
                new google.maps.marker.AdvancedMarkerElement({
                    position: center,
                    map: map,
                });
            }
        }
    };

    return (
        <LoadScript 
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
            libraries={['marker']}
        >
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center || defaultMapConfig.center}
                zoom={zoom}
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