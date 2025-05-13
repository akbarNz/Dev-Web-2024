import React from 'react';
import { Link } from 'react-router-dom';
import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import MusicNoteIcon from '@mui/icons-material/MusicNote'; // Using MusicNote for TikTok
import CopyrightIcon from '@mui/icons-material/Copyright';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.grid}>
                <div className={styles.links}>
                    <Link to="/contact">Contact Us</Link>
                    <Link to="/cookies">Cookies</Link>
                    <Link to="/privacy">Privacy Policy</Link>
                    <Link to="/terms">Terms & Conditions</Link>
                </div>
                
                <div className={styles.socials}>
                    <a 
                        href="https://instagram.com/zikfreak" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        <InstagramIcon /> Instagram
                    </a>
                    <a 
                        href="https://x.com/zikfreak" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        <XIcon /> X
                    </a>
                    <a 
                        href="https://tiktok.com/@zikfreak" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        <MusicNoteIcon /> TikTok
                    </a>
                </div>

                <div className={styles.copyright}>
                    <p>
                        <CopyrightIcon /> 2025 ZikFreak. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;