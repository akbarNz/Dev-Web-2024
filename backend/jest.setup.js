require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const setupTestDatabase = require('./src/config/testSetup');

// Initialize global prisma client
global.prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.TEST_DATABASE_URL
        }
    }
});

// Setup test database
beforeAll(async () => {
    const isSetup = await setupTestDatabase();
    if (!isSetup) {
        throw new Error('Failed to setup test database');
    }
});

afterAll(async () => {
    await global.prisma.$disconnect();
});