import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { carouselData } from './data/carouselData';
import styles from './AboutApp.module.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CustomArrow = ({ onClick, direction }) => (
    <button
        className={`${styles.arrowButton} ${direction === 'prev' ? styles.prevArrow : styles.nextArrow}`}
        onClick={onClick}
        type="button"
        aria-label={direction === 'prev' ? 'Previous' : 'Next'}
    >
        {direction === 'prev' ? <ArrowBackIosIcon /> : <ArrowForwardIosIcon />}
    </button>
);

CustomArrow.propTypes = {
    onClick: PropTypes.func,
    direction: PropTypes.oneOf(['prev', 'next']).isRequired
};

const AboutApp = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        prevArrow: <CustomArrow direction="prev" />,
        nextArrow: <CustomArrow direction="next" />,
        dotsClass: `slick-dots ${styles.dots}`,
        cssEase: "linear",
        fade: false
    };

    return (
        <article className={styles.aboutApp}>
            <section className={styles.description}>
                <h2>Where legends are born!</h2>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do 
                    eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut 
                    enim ad minim veniam, quis nostrud exercitation ullamco laboris 
                    nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor 
                    in reprehenderit in voluptate velit esse cillum dolore eu fugiat 
                    nulla pariatur. Excepteur sint occaecat cupidatat non proident, 
                    sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
            </section>

            <aside className={styles.carousel}>
                <Slider {...settings}>
                    {carouselData.map(item => (
                        <div key={item.id} className={styles.slide}>
                            <div className={styles.slideInfo}>
                                <span className={styles.artistName}>{item.artistName}</span>
                                <span className={styles.studioInfo}>
                                    {item.studioName} • {item.city}
                                </span>
                            </div>
                            <img src={item.imageUrl} alt={`${item.artistName} at ${item.studioName}`} />
                        </div>
                    ))}
                </Slider>
            </aside>
        </article>
    );
};

export default AboutApp;