require('dotenv').config();
const { PrismaClient, RoleUtilisateurs, StatutStudio } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.TEST_DATABASE_URL
        }
    }
});

async function seedTestData() {
    try {
        // Create test ville first
        const ville = await prisma.ville.create({
            data: {
                code_postal: 1000,
                ville: 'Bruxelles'
            }
        });

        // Create test proprio
        const proprio = await prisma.proprio.create({
            data: {
                nom: 'Test Owner',
                email: 'test@example.com',
                numero_telephone: '+32123456789',
                role: RoleUtilisateurs.proprietaire
            }
        });

        // Create test client
        const client = await prisma.client.create({
            data: {
                nom: 'Test Client',
                email: 'client@example.com',
                numero_telephone: '+32987654321',
                role: RoleUtilisateurs.artiste
            }
        });

        // Create test studio with valid code_postal
        const studio = await prisma.studio.create({
            data: {
                nom: 'Test Studio',
                adresse: 'Test Address',
                latitude: 50.8503,
                longitude: 4.3517,
                prix_par_heure: 50,
                code_postal: ville.code_postal,  // Reference the created ville
                statut: StatutStudio.valide,
                proprietaire_id: proprio.id
            }
        });

        // Create test review
        await prisma.avis.create({
            data: {
                client_id: client.id,
                studio_id: studio.id,
                note: 5
            }
        });

        console.log('Test data seeded successfully');
    } catch (error) {
        console.error('Error seeding test data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedTestData();