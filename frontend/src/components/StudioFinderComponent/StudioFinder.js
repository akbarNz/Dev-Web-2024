import React, { useState, useCallback, useEffect } from 'react';
import { findNearbyStudios } from '../../services/studioService';
import Header from '../HeaderComponent';
import GeolocationComponent from '../GeolocationComponent/GeolocationComponent';
import FindStudio from '../FindStudioComponent';
import Map from '../MapComponent/Map';
import AboutApp from '../AboutAppComponent/AboutApp';
import BestRatedStudios from '../BestRatedStudiosComponent/BestRatedStudios';
import styles from './StudioFinder.module.css';

const StudioFinder = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [studios, setStudios] = useState([]);
    const [showMap, setShowMap] = useState(false);
    const [searchParams, setSearchParams] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState(null);
    const [bestRatedStudios, setBestRatedStudios] = useState([]);

    const handleLocationFound = useCallback((location) => {
        setUserLocation(location);
    }, []);

    const fetchStudios = useCallback(async (criteria, value, location) => {
        try {
            setError(null);
            setIsSearching(true);
            const data = await findNearbyStudios(criteria, value, location);
            setStudios(data);
            setShowMap(true);
        } catch (err) {
            setError('Failed to fetch studios. Please try again.');
            console.error('Error fetching studios:', err);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleSearch = useCallback((searchCriteria) => {
        if (isSearching) return;
        
        if (!userLocation) {
            alert('Please allow location access to search for studios');
            return;
        }

        setSearchParams(searchCriteria);
        fetchStudios(searchCriteria.criteria, searchCriteria.value, userLocation);
    }, [userLocation, isSearching, fetchStudios]);
    
    // Add this below your existing useEffect
    useEffect(() => {
        if (userLocation) {
            // This is a placeholder until we implement the backend
            // We'll replace this with actual API call later
            console.log('Fetching best rated studios...');
        }
    }, [userLocation]);

    return (
        <div className={styles.landingPage}>
            <Header />
            <main className={styles.mainContent}>
                <div className={styles.studioFinder}>
                    <GeolocationComponent onLocationFound={handleLocationFound} />
                    
                    <FindStudio 
                        onSearch={handleSearch} 
                        userLocation={userLocation}
                        disabled={!userLocation || isSearching}
                    />

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    {isSearching && (
                        <div className={styles.loading}>
                            Searching for studios...
                        </div>
                    )}

                    {showMap && !isSearching && studios.length === 0 && (
                        <div className={styles.noResults}>
                            No studios found for your search criteria
                        </div>
                    )}

                    {showMap && searchParams && studios.length > 0 && (
                        <Map 
                            center={userLocation}
                            studios={studios}
                            searchParams={searchParams}
                        />
                    )}
                </div>
                <AboutApp />
                <BestRatedStudios 
                        studios={bestRatedStudios}
                        userLocation={userLocation}
                        onEnableLocation={() => {
                            // This will use the existing geolocation logic
                            const geoComponent = document.querySelector('[data-testid="geo-button"]');
                            if (geoComponent) geoComponent.click();
                        }}
                    />
            </main>
        </div>
    );
};

export default React.memo(StudioFinder);