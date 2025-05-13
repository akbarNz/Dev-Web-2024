require('dotenv').config();
const { TextEncoder, TextDecoder } = require('util');
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

// Set up globals
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Switch to test database URL when running tests
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

// Create prisma client with test configuration
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.TEST_DATABASE_URL,
        },
    },
});

// Make prisma available globally for tests
global.prisma = prisma;

// Reset database before running tests
beforeAll(async () => {
    try {
        execSync('node scripts/resetTestDb.js', { stdio: 'inherit' });
    } catch (error) {
        console.error('Error resetting test database:', error);
        throw error;
    }
});

// Cleanup after tests
afterAll(async () => {
    await prisma.$disconnect();
});