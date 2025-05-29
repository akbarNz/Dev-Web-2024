// Test for database configuration
// database.test.js
const { testConnection } = require('../database');
const setupTestDatabase = require('../testSetup');
const { PrismaClient } = require('@prisma/client');

describe('Database Configuration', () => {
    let prisma;

    beforeAll(async () => {
        // Initialize Prisma client with test database
        prisma = new PrismaClient({
            datasources: {
                db: {
                    url: process.env.TEST_DATABASE_URL
                }
            }
        });

        // Setup test database with sample data
        const isSetup = await setupTestDatabase();
        if (!isSetup) {
            throw new Error('Failed to setup test database');
        }
    });

    test('should connect to database successfully', async () => {
        const isConnected = await testConnection();
        expect(isConnected).toBe(true);
    });

    test('should have sample data loaded', async () => {
        // Test villes
        const villes = await prisma.ville.findMany();
        expect(villes.length).toBeGreaterThan(0);

        // Test studios
        const studios = await prisma.studio.findMany();
        expect(studios.length).toBeGreaterThan(0);

        // Test proprios
        const proprios = await prisma.proprio.findMany();
        expect(proprios.length).toBeGreaterThan(0);
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });
});

describe('Database Connection', () => {
    it('should connect to test database successfully', async () => {
        try {
            await global.prisma.$connect();
            const result = await global.prisma.$queryRaw`SELECT current_database()`;
            expect(result[0].current_database).toBe('zikfreakdb_test');
        } catch (error) {
            fail('Database connection failed: ' + error.message);
        }
    });
});