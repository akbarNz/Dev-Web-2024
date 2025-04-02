import { findNearbyStudios } from '../studioService';

describe('studioService', () => {
    beforeEach(() => {
        fetch.resetMocks();
    });

    test('findNearbyStudios fetches data successfully', async () => {
        const mockStudios = [
            { id: 1, nom: 'Studio A', latitude: 48.8566, longitude: 2.3522 }
        ];

        fetch.mockResponseOnce(JSON.stringify(mockStudios), { status: 200 });

        const result = await findNearbyStudios(48.8566, 2.3522);
        expect(result).toEqual(mockStudios);
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/studios/nearby?lat=48.8566&lng=2.3522')
        );
    });

    test('findNearbyStudios handles API errors', async () => {
        fetch.mockResponseOnce(
            JSON.stringify({ message: 'API Error' }), 
            { status: 500 }
        );

        await expect(findNearbyStudios(48.8566, 2.3522))
            .rejects
            .toThrow('Failed to fetch nearby studios');
    });

    test('findNearbyStudios handles network errors', async () => {
        fetch.mockReject(new Error('Network error'));

        await expect(findNearbyStudios(48.8566, 2.3522))
            .rejects
            .toThrow('Failed to fetch nearby studios');
    });
});