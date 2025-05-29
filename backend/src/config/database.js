// database.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.NODE_ENV === 'test' 
                ? process.env.TEST_DATABASE_URL 
                : process.env.DATABASE_URL
        }
    }
});

// Test database connection
const testConnection = async () => {
    try {
        await prisma.$connect();
        console.log('Database connection successful');
        return true;
    } catch (err) {
        console.error('Database connection error:', err.message);
        return false;
    } finally {
        await prisma.$disconnect();
    }
};

module.exports = {
    prisma,
    testConnection
};