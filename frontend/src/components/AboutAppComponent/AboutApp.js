import React from 'react';
import Slider from 'react-slick';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import styles from './AboutApp.module.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// Import images directly using relative paths
import studio1 from '../../assets/images/pexels-cristian-rojas-7586264.jpg';
import studio2 from '../../assets/images/pexels-rdne-8198067.jpg';
import studio3 from '../../assets/images/pexels-anthonyshkraba-production-8412396.jpg';

const dummyCarouselData = [
    {
        id: 1,
        artistName: 'John Doe',
        studioName: 'Sonic Lab Brussels',
        city: 'Brussels',
        imageUrl: studio1
    },
    {
        id: 2,
        artistName: 'Jane Smith',
        studioName: 'Beat Factory',
        city: 'Brussels',
        imageUrl: studio2
    },
    {
        id: 3,
        artistName: 'Mike Johnson',
        studioName: 'Melody House',
        city: 'Brussels',
        imageUrl: studio3
    }
];

const CustomArrow = ({ className, onClick, direction }) => (
    <button
        className={`${styles.arrowButton} ${direction === 'prev' ? styles.prevArrow : styles.nextArrow}`}
        onClick={onClick}
        type="button"
        aria-label={direction === 'prev' ? 'Previous' : 'Next'}
    >
        {direction === 'prev' ? <ArrowBackIosIcon /> : <ArrowForwardIosIcon />}
    </button>
);

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
                    {dummyCarouselData.map(item => (
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