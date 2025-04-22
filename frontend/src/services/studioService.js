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