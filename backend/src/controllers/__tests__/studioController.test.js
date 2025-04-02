const StudioController = require('../studioController');
const Studio = require('../../models/Studio');
const { Decimal } = require('@prisma/client');

// Mock the Studio model
jest.mock('../../models/Studio');

describe('StudioController', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        mockRequest = {
            query: {},
            params: {},
            body: {}
        };
        mockResponse = {
            json: jest.fn(),
            status: jest.fn(() => mockResponse)
        };
    });

    describe('getNearbyStudios', () => {
        test('should return nearby studios when valid coordinates provided', async () => {
            const mockStudios = [
                { id: 1, nom: 'Studio A' },
                { id: 2, nom: 'Studio B' }
            ];

            Studio.findNearby.mockResolvedValue(mockStudios);
            mockRequest.query = { lat: '48.8566', lng: '2.3522', radius: '5' };

            await StudioController.getNearbyStudios(mockRequest, mockResponse);

            expect(Studio.findNearby).toHaveBeenCalledWith(48.8566, 2.3522, 5);
            expect(mockResponse.json).toHaveBeenCalledWith(mockStudios);
        });

        test('should return 400 when coordinates are missing', async () => {
            await StudioController.getNearbyStudios(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Latitude and longitude are required'
            });
        });
    });
});