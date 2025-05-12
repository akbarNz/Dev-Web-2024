const API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
    throw new Error('API URL not configured');
}

export const findNearbyStudios = async (criteria, searchValue, location) => {
    try {
        let url = new URL(`${API_URL}/studios/search`);
        const params = new URLSearchParams();
        params.append('criteria', criteria);

        switch (criteria) {
            case 'radius':
                params.append('lat', location.lat);
                params.append('lng', location.lng);
                params.append('radius', searchValue);
                break;
            case 'studio':
                params.append('lat', location.lat);
                params.append('lng', location.lng);
                params.append('name', searchValue);
                break;
            case 'city':
                params.append('city', searchValue);
                break;
            default:
                throw new Error('Invalid search criteria');
        }

        url.search = params.toString();
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch studios');
        }

        return data;
    } catch (error) {
        throw new Error('Failed to fetch studios');
    }
};

export const findBestRatedStudios = async (location, radius = 5, minRating = 4) => {
    try {
        
        let url = new URL(`${API_URL}/studios/best-rated`);
        const params = new URLSearchParams({
            lat: location.lat.toString(),
            lng: location.lng.toString(),
            radius: radius.toString(),
            minRating: minRating.toString()
        });

        url.search = params.toString();
        const response = await fetch(url);
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to fetch best rated studios');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching best rated studios:', error);
        throw error;
    }
};