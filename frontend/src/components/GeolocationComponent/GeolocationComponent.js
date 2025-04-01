import React, { useState, useEffect } from 'react';
import Map from './Map';

const GeolocationComponent = () => {
    // State to store location coordinates and error
    const [location, setLocation] = useState({
        latitude: null,
        longitude: null
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Success handler for geolocation
    const handleSuccess = (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLoading(false);
    };

    // Error handler for geolocation
    const handleError = (error) => {
        setError(error.message);
        setLoading(false);
    };

    // Effect hook to get geolocation when component mounts
    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(handleSuccess, handleError);
    }, []);

    const mapCenter = location.latitude && location.longitude
    ? { lat: location.latitude, lng: location.longitude }
    : null;

    // Render different states
    if (loading) return <div>Loading location...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Your Location:</h2>
            <p>Latitude: {location.latitude}</p>
            <p>Longitude: {location.longitude}</p>
            <Map center={mapCenter} />
        </div>
    );
};

export default GeolocationComponent;