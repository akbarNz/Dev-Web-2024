import React, { useState } from 'react';
import styles from './FindStudio.module.css';

const FindStudio = ({ onSearch, disabled }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchCriteria, setSearchCriteria] = useState('radius');
    const [searchValue, setSearchValue] = useState('');

    const handleFilterClick = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    const handleCriteriaSelect = (criteria) => {
        setSearchCriteria(criteria);
        setIsFilterOpen(false);
    };

    const handleSearch = (e) => {
        e.preventDefault(); // Prevent form submission
        if (!disabled && searchValue.trim()) {
            onSearch({ criteria: searchCriteria, value: searchValue.trim() });
        }
    };

    return (
        <div className={styles.findStudioContainer}>
            <h2 className={styles.title}>Find a studio nearby in one click!</h2>
            
            <form onSubmit={handleSearch} className={styles.searchContainer}>
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
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
                        🔍
                    </button>
                    <button 
                        type="submit"
                        className={styles.searchButton}
                        disabled={disabled || !searchValue.trim()}
                    >
                        Search
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
            </form>
        </div>
    );
};

export default FindStudio;