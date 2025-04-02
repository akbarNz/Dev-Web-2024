import React, { useState, useEffect } from 'react';
import { findNearbyStudios } from '../../services/studioService';
import Map from './Map';
import './GeolocationComponent.css';

const GeolocationComponent = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [nearbyStudios, setNearbyStudios] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const userPos = { lat: latitude, lng: longitude };
                    setUserLocation(userPos);
                    
                    try {
                        const studios = await findNearbyStudios(latitude, longitude);
                        setNearbyStudios(studios);
                    } catch (err) {
                        setError('Failed to fetch nearby studios');
                    } finally {
                        setLoading(false);
                    }
                },
                (err) => {
                    setError('Failed to get location');
                    setLoading(false);
                }
            );
        } else {
            setError('Geolocation is not supported');
            setLoading(false);
        }
    }, []);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="geolocation-container">
            <Map 
                center={userLocation}
                zoom={13}
                markers={[
                    {
                        position: userLocation,
                        icon: '/user-location.png',
                        title: 'Your location'
                    },
                    ...nearbyStudios.map(studio => ({
                        position: { 
                            lat: studio.latitude, 
                            lng: studio.longitude 
                        },
                        title: studio.nom
                    }))
                ]}
            />
        </div>
    );
};

export default GeolocationComponent;