const API_URL = process.env.REACT_APP_API_URL;

if (!API_URL) {
    throw new Error('API URL not configured');
}

export const findNearbyStudios = async (latitude, longitude, radius = 5) => {
    try {
        const response = await fetch(
            `${API_URL}/studios/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch nearby studios');
        }

        return data;
    } catch (error) {
        throw new Error('Failed to fetch nearby studios');
    }
};