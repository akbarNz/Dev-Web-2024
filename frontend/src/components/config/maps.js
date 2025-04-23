export const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
// Set a default Map ID if environment variable is not available
export const GOOGLE_MAPS_ID = process.env.REACT_APP_GOOGLE_MAPS_ID || '2dab99d4b0d696bb';

export const mapOptions = {
    zoom: 13,
    mapId: GOOGLE_MAPS_ID,
    disableDefaultUI: false,
    styles: []
};