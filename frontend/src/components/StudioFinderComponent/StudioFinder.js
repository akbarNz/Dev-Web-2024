import React, { useState, useCallback } from 'react';
import GeolocationComponent from '../GeolocationComponent/GeolocationComponent';
import FindStudio from '../FindStudioComponent';
import Map from '../MapComponent/Map';
import styles from './StudioFinder.module.css';

const StudioFinder = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [nearbyStudios, setNearbyStudios] = useState([]);
    const [showMap, setShowMap] = useState(false);
    const [searchParams, setSearchParams] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleLocationFound = (location) => {
        setUserLocation(location);
    };

    const handleSearch = useCallback((searchCriteria) => {
        if (isSearching) return;
        
        if (!userLocation) {
            alert('Please allow location access to search for studios');
            return;
        }

        setIsSearching(true);
        setSearchParams(searchCriteria);
        setShowMap(true);
    }, [userLocation, isSearching]);

    const handleStudiosFound = useCallback((studios) => {
        setNearbyStudios(studios);
        setIsSearching(false);
    }, []);

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
            {showMap && searchParams && (
                <Map 
                    key={`${searchParams.criteria}-${searchParams.value}`}
                    center={userLocation}
                    searchParams={searchParams}
                    onStudiosFound={handleStudiosFound}
                />
            )}
        </div>
    );
};

export default React.memo(StudioFinder);