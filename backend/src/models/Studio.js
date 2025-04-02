const { PrismaClient, Decimal } = require('@prisma/client');
const prisma = new PrismaClient();

class Studio {
    static async findNearby(lat, lng, radius = 5) {
        try {
            // Using Prisma's raw query with correct table name
            return await prisma.$queryRaw`
                WITH StudioDistance AS (
                    SELECT *,
                        ( 6371 * acos( cos( radians(${lat}) )
                            * cos( radians(latitude) )
                            * cos( radians(longitude) - radians(${lng}) )
                            + sin( radians(${lat}) )
                            * sin( radians(latitude) )
                        ) ) AS distance
                    FROM studios
                    WHERE statut = 'validé'
                )
                SELECT * FROM StudioDistance
                WHERE distance < ${radius}
                ORDER BY distance;
            `;
        } catch (err) {
            throw new Error(`Error finding nearby studios: ${err.message}`);
        }
    }

    static async findById(id) {
        try {
            return await prisma.studio.findUnique({
                where: { id: parseInt(id) }
            });
        } catch (err) {
            throw new Error(`Error finding studio by ID: ${err.message}`);
        }
    }

    static async create(studioData) {
        try {
            return await prisma.studio.create({
                data: {
                    nom: studioData.nom,
                    description: studioData.description,
                    longitude: parseFloat(studioData.longitude),
                    latitude: parseFloat(studioData.latitude),
                    adresse: studioData.adresse,
                    prix_par_heure: new Decimal(studioData.prix_par_heure),
                    equipements: studioData.equipements, // Prisma will handle JSON conversion
                    photo_url: studioData.photo_url,
                    code_postal: parseInt(studioData.code_postal),
                    proprietaire_id: parseInt(studioData.proprietaire_id),
                    statut: studioData.statut
                }
            });
        } catch (err) {
            throw new Error(`Error creating studio: ${err.message}`);
        }
    }
}

module.exports = Studio;