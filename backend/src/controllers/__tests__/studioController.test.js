const { PrismaClient, StatutStudio } = require('@prisma/client');
const StudioController = require('../studioController');
const Studio = require('../../models/Studio');

const prisma = new PrismaClient();

// Mock the Studio model
jest.mock('../../models/Studio');

describe('StudioController', () => {
    let mockRequest;
    let mockResponse;
    let testStudio;
    let testClient;
    let testVille;

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

    beforeEach(async () => {
        await prisma.avis.deleteMany();
        await prisma.studio.deleteMany();
    });

    beforeAll(async () => {
        // Create test ville first
        testVille = await global.prisma.ville.findFirst();

        // Use existing studio from seed data
        testStudio = await global.prisma.studio.findFirst({
            where: {
                code_postal: testVille.code_postal
            }
        });

        // Create test client
        testClient = await global.prisma.client.create({
            data: {
                nom: 'Test Client',
                email: 'test@example.com',
                numero_telephone: '+32123456789',
                role: 'artiste'
            }
        });

        // Create test review
        await global.prisma.avis.create({
            data: {
                client_id: testClient.id,
                studio_id: testStudio.id,
                note: 5
            }
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();

        // Clean up test data
        await global.prisma.avis.deleteMany();
        await global.prisma.studio.deleteMany();
        await global.prisma.client.deleteMany();
        await global.prisma.ville.deleteMany();
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

    describe('getBestRatedStudios', () => {
        it('should return best rated studios within radius', async () => {
            const req = {
                query: {
                    lat: '50.8503',
                    lng: '4.3517',
                    radius: '5',
                    minRating: '4'
                }
            };
            const res = {
                json: jest.fn(),
                status: jest.fn().mockReturnThis()
            };

            await StudioController.getBestRatedStudios(req, res);

            expect(res.json).toHaveBeenCalled();
            const studios = res.json.mock.calls[0][0];
            expect(Array.isArray(studios)).toBeTruthy();
            expect(studios.length).toBeGreaterThan(0);
            expect(studios[0].rating).toBeGreaterThanOrEqual(4);
        });
    });

    describe('findNearby', () => {
        it('should return studios within radius', async () => {
            const studio = await prisma.studio.create({
                data: {
                    nom: 'Test Studio',
                    adresse: 'Test Address',
                    latitude: 50.8503,
                    longitude: 4.3517,
                    prix_par_heure: 50,
                    code_postal: 1000,
                    statut: 'validé',
                    proprietaire_id: 1
                }
            });

            const result = await Studio.findNearby(50.8503, 4.3517, 5);
            
            expect(result.length).toBeGreaterThan(0);
            expect(result[0].distance).toBeLessThan(5);
        });
    });

    describe('getStudios', () => {
        it('should return studios for the given postal code', async () => {
            mockRequest.params = { code_postal: testVille.code_postal };

            await StudioController.getStudios(mockRequest, mockResponse);

            expect(mockResponse.json).toHaveBeenCalled();
            const studios = mockResponse.json.mock.calls[0][0];
            expect(Array.isArray(studios)).toBeTruthy();
            expect(studios.length).toBeGreaterThan(0);
            expect(studios[0].code_postal).toEqual(testVille.code_postal);
        });

        it('should return 404 if no studios found', async () => {
            mockRequest.params = { code_postal: '9999' }; // Assuming 9999 has no studios

            await StudioController.getStudios(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'No studios found for the given postal code'
            });
        });
    });
});