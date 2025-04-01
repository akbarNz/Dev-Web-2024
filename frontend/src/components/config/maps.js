export const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
export const GOOGLE_MAPS_ID = process.env.REACT_APP_GOOGLE_MAPS_ID;

export const defaultMapConfig = {
    center: {
        lat: 48.8566,  // Default to Paris coordinates
        lng: 2.3522
    },
    zoom: 13
};