import React, { useState, useEffect } from 'react';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import styles from './FindStudio.module.css';

const FindStudio = ({ onSearch, disabled, isMapView }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchCriteria, setSearchCriteria] = useState('radius');
    const [searchValue, setSearchValue] = useState('');
    const [componentHeight, setComponentHeight] = useState(window.screen.availHeight);

    useEffect(() => {
        const handleResize = () => {
            setComponentHeight(window.screen.availHeight);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleFilterClick = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    const handleCriteriaSelect = (criteria) => {
        setSearchCriteria(criteria);
        setIsFilterOpen(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !disabled && searchValue.trim()) {
            onSearch({ criteria: searchCriteria, value: searchValue.trim() });
        }
    };

    return (
        <div 
            className={`${styles.findStudioContainer} ${isMapView ? styles.mapView : ''}`}
            style={{ height: isMapView ? 'auto' : `${componentHeight}px` }}
        >
            <h2 className={`${styles.title} ${isMapView ? styles.mapViewTitle : ''}`}>
                Find a studio nearby in one click!
            </h2>
            
            <div className={`${styles.searchContainer} ${isMapView ? styles.mapViewSearch : ''}`}>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`Search by ${searchCriteria}...`}
                        className={styles.searchInput}
                        disabled={disabled}
                    />
                    <button 
                        type="button"
                        onClick={handleFilterClick}
                        className={styles.filterButton}
                        disabled={disabled}
                    >
                        <FilterAltIcon />
                    </button>
                </div>
                
                {isFilterOpen && (
                    <div className={styles.filterDropdown}>
                        <button 
                            type="button"
                            onClick={() => handleCriteriaSelect('radius')}
                            className={searchCriteria === 'radius' ? styles.active : ''}
                        >
                            Radius
                        </button>
                        <button 
                            type="button"
                            onClick={() => handleCriteriaSelect('studio')}
                            className={searchCriteria === 'studio' ? styles.active : ''}
                        >
                            Studio Name
                        </button>
                        <button 
                            type="button"
                            onClick={() => handleCriteriaSelect('city')}
                            className={searchCriteria === 'city' ? styles.active : ''}
                        >
                            City
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindStudio;