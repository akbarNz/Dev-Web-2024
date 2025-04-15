import React, { useState } from 'react';
import GeolocationComponent from '../GeolocationComponent/GeolocationComponent';
import FindStudio from '../FindStudioComponent';
import Map from '../MapComponent/Map';
import styles from './StudioFinder.module.css';

const StudioFinder = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [nearbyStudios, setNearbyStudios] = useState([]);
    const [showMap, setShowMap] = useState(false);
    const [searchParams, setSearchParams] = useState(null);

    const handleLocationFound = (location) => {
        setUserLocation(location);
    };

    const handleSearch = (searchCriteria) => {
        if (!userLocation) {
            alert('Please allow location access to search for studios');
            return;
        }
        setSearchParams(searchCriteria);
        setShowMap(true);
    };

    const handleStudiosFound = (studios) => {
        setNearbyStudios(studios);
    };

    return (
        <div className={styles.studioFinder}>
            <GeolocationComponent 
                onLocationFound={handleLocationFound}
            />
            <FindStudio 
                onSearch={handleSearch} 
                userLocation={userLocation}
                disabled={!userLocation}
            />
            {showMap && (
                <Map 
                    center={userLocation}
                    searchParams={searchParams}
                    onStudiosFound={handleStudiosFound}
                />
            )}
        </div>
    );
};

export default StudioFinder;