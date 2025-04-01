// Test for database configuration
// database.test.js
const { pool, testConnection } = require('../database');

describe('Database Configuration', () => {
    beforeAll(async () => {
        // Ensure database is ready before tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    test('should connect to database successfully', async () => {
        const isConnected = await testConnection();
        expect(isConnected).toBe(true);
    });

    test('should have required environment variables', () => {
        expect(process.env.DB_USER).toBeDefined();
        expect(process.env.DB_HOST).toBeDefined();
        expect(process.env.DB_DATABASE).toBeDefined();
        expect(process.env.DB_PASSWORD).toBeDefined();
        expect(process.env.DB_PORT).toBeDefined();
    });

    afterAll(async () => {
        await pool.end();
    });
});