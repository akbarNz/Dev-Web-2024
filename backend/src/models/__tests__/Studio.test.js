const { PrismaClient, Decimal } = require('@prisma/client');
const Studio = require('../Studio');

const prisma = new PrismaClient();

describe('Studio Model', () => {
    beforeEach(async () => {
        await prisma.studio.deleteMany();
    });

    test('should find nearby studios', async () => {
        const testStudio = await Studio.create({
            nom: 'Test Studio',
            description: 'Test Description',
            longitude: 2.3522,
            latitude: 48.8566,
            adresse: '1 Test Street',
            prix_par_heure: new Decimal('50.00'),
            equipements: { items: ['mic', 'speaker'] },
            photo_url: 'test.jpg',
            code_postal: 75001,
            statut: 'valide',
            proprietaire_id: 1
        });

        const nearbyStudios = await Studio.findNearby(48.8566, 2.3522, 5);
        expect(nearbyStudios).toHaveLength(1);
        expect(nearbyStudios[0].nom).toBe('Test Studio');
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });
});