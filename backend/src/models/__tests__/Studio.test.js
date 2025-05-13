const { PrismaClient, Decimal } = require('@prisma/client');
const Studio = require('../Studio');

const prisma = new PrismaClient();

describe('Studio Model', () => {
    beforeEach(async () => {
        // Reset database before each test
        await global.prisma.avis.deleteMany();
        await global.prisma.studio.deleteMany();
        await global.prisma.ville.deleteMany();
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

    describe('findNearbyBestRatedStudios', () => {
        it('should return studios with ratings above minimum', async () => {
            // Create test ville
            const ville = await global.prisma.ville.create({
                data: {
                    code_postal: 1000,
                    ville: 'Bruxelles'
                }
            });

            // Create test studio
            const studio = await global.prisma.studio.create({
                data: {
                    nom: 'Test Studio',
                    adresse: 'Test Address',
                    latitude: 50.8503,
                    longitude: 4.3517,
                    prix_par_heure: 50,
                    code_postal: ville.code_postal,
                    statut: 'validé',
                    proprietaire_id: 1
                }
            });

            // Create test reviews
            await global.prisma.avis.create({
                data: {
                    client_id: 1,
                    studio_id: studio.id,
                    note: 5
                }
            });

            const studios = await Studio.findNearbyBestRatedStudios(50.8503, 4.3517, 5, 4);
            
            expect(studios).toBeDefined();
            expect(Array.isArray(studios)).toBeTruthy();
            expect(studios.length).toBeGreaterThan(0);
            expect(studios[0].rating).toBeGreaterThanOrEqual(4);
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });
});