const request = require('supertest');
const express = require('express');
const studioRoutes = require('../studios');
const { PrismaClient } = require('@prisma/client');

// Mock PrismaClient
jest.mock('@prisma/client');

describe('Studio Routes', () => {
    let app;
    let mockPrisma;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/api/studios', studioRoutes);
    });

    beforeEach(() => {
        mockPrisma = {
            studio: {
                findMany: jest.fn(),
                findUnique: jest.fn()
            },
            $queryRaw: jest.fn()
        };
        PrismaClient.mockImplementation(() => mockPrisma);
    });

    describe('GET /api/studios/search', () => {
        const testCases = [
            {
                name: 'radius search',
                query: { criteria: 'radius', lat: '50.8503', lng: '4.3517', radius: '5' },
                mockData: [{ id: 1, nom: 'Studio Test', distance: 2.5 }]
            },
            {
                name: 'name search',
                query: { criteria: 'studio', name: 'Test', lat: '50.8503', lng: '4.3517' },
                mockData: [{ id: 1, nom: 'Studio Test' }]
            },
            {
                name: 'city search',
                query: { criteria: 'city', city: 'Brussels' },
                mockData: [{ id: 1, nom: 'Studio Test' }]
            }
        ];

        testCases.forEach(({ name, query, mockData }) => {
            test(`should handle ${name}`, async () => {
                if (query.criteria === 'city') {
                    mockPrisma.studio.findMany.mockResolvedValue(mockData);
                } else {
                    mockPrisma.$queryRaw.mockResolvedValue(mockData);
                }

                const response = await request(app)
                    .get('/api/studios/search')
                    .query(query);

                expect(response.status).toBe(200);
                expect(Array.isArray(response.body)).toBeTruthy();
                if (query.criteria === 'radius') {
                    expect(response.body[0]).toHaveProperty('distance');
                }
            });
        });
    });

    describe('GET /api/studios/best-rated', () => {
        test('should return best rated studios', async () => {
            const mockData = [{
                id: 1,
                nom: 'Studio Test',
                rating: 4.5,
                review_count: 10,
                distance: 2.5
            }];

            mockPrisma.$queryRaw.mockResolvedValue(mockData);

            const response = await request(app)
                .get('/api/studios/best-rated')
                .query({
                    lat: '50.8503',
                    lng: '4.3517',
                    radius: '5',
                    minRating: '4'
                });

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
            expect(response.body[0]).toHaveProperty('rating');
            expect(response.body[0].rating).toBeGreaterThanOrEqual(4);
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});