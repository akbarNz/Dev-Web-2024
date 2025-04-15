const API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
    throw new Error('API URL not configured');
}

export const findNearbyStudios = async (criteria, searchValue, location) => {
    try {
        let url;
        switch (criteria) {
            case 'radius':
                url = `${API_URL}/studios/nearby?lat=${location.lat}&lng=${location.lng}&radius=${searchValue}`;
                break;
            case 'studio':
                url = `${API_URL}/studios/search?name=${searchValue}&lat=${location.lat}&lng=${location.lng}`;
                break;
            case 'city':
                url = `${API_URL}/studios/city?city=${searchValue}`;
                break;
            default:
                throw new Error('Invalid search criteria');
        }

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