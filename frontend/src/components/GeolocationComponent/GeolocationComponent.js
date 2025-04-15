import React, { useEffect, useState } from 'react';

const GeolocationComponent = ({ onLocationFound }) => {
    const [error, setError] = useState(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    onLocationFound({ lat: latitude, lng: longitude });
                },
                (err) => {
                    setError('Failed to get location');
                }
            );
        } else {
            setError('Geolocation is not supported');
        }
    }, [onLocationFound]);

    if (error) return <div className="error">Error: {error}</div>;
    return null; // Component doesn't need to render anything visible
};

export default GeolocationComponent;