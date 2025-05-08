import React from 'react';
import PropTypes from 'prop-types';
import styles from './BestRatedStudios.module.css';

const BestRatedStudios = ({ studios, userLocation, onEnableLocation }) => {
    if (!userLocation) {
        return (
            <section className={styles.container}>
                <div className={styles.message}>
                    <h2>Best Rated Studios Near You</h2>
                    <p>Please enable location to see the best studios in your area</p>
                    <button 
                        onClick={onEnableLocation}
                        className={styles.enableButton}
                    >
                        Enable Location
                    </button>
                </div>
            </section>
        );
    }

    if (!studios?.length) {
        return (
            <section className={styles.container}>
                <div className={styles.message}>
                    <h2>Best Rated Studios Near You</h2>
                    <p>No rated studios yet in your area</p>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.container}>
            <h2>Best Rated Studios Near You</h2>
            <div className={styles.grid}>
                {studios.map(studio => (
                    <article key={studio.id} className={styles.studioCard}>
                        <div className={styles.imageContainer}>
                            <img src={studio.photo_url} alt={studio.nom} />
                            <span className={styles.rating}>★ {studio.rating.toFixed(1)}</span>
                        </div>
                        <div className={styles.info}>
                            <h3>{studio.nom}</h3>
                            <p>{studio.adresse}</p>
                            <p className={styles.price}>€{studio.prix_par_heure}/hour</p>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

BestRatedStudios.propTypes = {
    studios: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            nom: PropTypes.string.isRequired,
            adresse: PropTypes.string.isRequired,
            prix_par_heure: PropTypes.number.isRequired,
            photo_url: PropTypes.string,
            rating: PropTypes.number.isRequired
        })
    ),
    userLocation: PropTypes.shape({
        lat: PropTypes.number.isRequired,
        lng: PropTypes.number.isRequired
    }),
    onEnableLocation: PropTypes.func.isRequired
};

export default BestRatedStudios;