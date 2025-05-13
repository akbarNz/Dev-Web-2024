const request = require('supertest');
const express = require('express');
const studioRoutes = require('../studios');
const { Decimal } = require('@prisma/client');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/studios', studioRoutes);

describe('Studio Routes', () => {
    test('GET /api/studios/nearby', async () => {
        const response = await request(app)
            .get('/api/studios/nearby')
            .query({ lat: '48.8566', lng: '2.3522', radius: '5' });

        expect(response.status).toBe(200);
    });

    test('GET /api/studios/:id', async () => {
        const response = await request(app)
            .get('/api/studios/1');

        expect(response.status).toBe(200);
    });

    test('POST /api/studios', async () => {
        const studioData = {
            nom: 'Test Studio',
            description: 'Test Description',
            longitude: 2.3522,
            latitude: 48.8566,
            adresse: '1 Test Street',
            prix_par_heure: '50.00',
            equipements: { items: ['mic', 'speaker'] },
            photo_url: 'test.jpg',
            code_postal: 75001,
            proprietaire_id: 1
        };

        const response = await request(app)
            .post('/api/studios')
            .send(studioData);

        expect(response.status).toBe(201);
    });
});