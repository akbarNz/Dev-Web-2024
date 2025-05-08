const { PrismaClient, Decimal } = require('@prisma/client');
const prisma = new PrismaClient();

class Studio {
    static async findNearby(lat, lng, radius = 5) {
        try {
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

    static async findNearbyBestRatedStudios(lat, lng, radius = 5, minRating = 4) {
        try {
            return await prisma.$queryRaw`
                WITH StudioRatings AS (
                    SELECT 
                        s.*,
                        ( 6371 * acos( cos( radians(${lat}) )
                            * cos( radians(latitude) )
                            * cos( radians(longitude) - radians(${lng}) )
                            + sin( radians(${lat}) )
                            * sin( radians(latitude) )
                        ) ) AS distance,
                        COALESCE(AVG(a.note)::numeric(10,2), 0) as rating,
                        COUNT(a.id) as review_count
                    FROM studio s
                    LEFT JOIN avis a ON s.id = a.studio_id
                    WHERE s.statut = 'validé'
                    GROUP BY s.id
                    HAVING COALESCE(AVG(a.note), 0) >= ${minRating}
                )
                SELECT * FROM StudioRatings
                WHERE distance < ${radius}
                ORDER BY rating DESC, review_count DESC, distance
                LIMIT 10;
            `;
        } catch (err) {
            throw new Error(`Error finding best rated studios: ${err.message}`);
        }
    }

    
    static async findByName(name, lat, lng) {
        try {
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
                    AND LOWER(nom) LIKE LOWER(${`%${name}%`})
                )
                SELECT * FROM StudioDistance
                ORDER BY distance;
            `;
        } catch (err) {
            throw new Error(`Error finding studios by name: ${err.message}`);
        }
    }

    static async findByCity(searchTerm) {
        try {
            const isPostalCode = /^\d+$/.test(searchTerm);
            
            if (isPostalCode) {
                // Direct search by postal code
                return await prisma.studio.findMany({
                    where: {
                        AND: [
                            { statut: 'valide' },
                            { code_postal: parseInt(searchTerm) }
                        ]
                    }
                });
            } else {
                // First find the postal code(s) for the given city name
                const cityPostalCodes = await prisma.ville.findMany({
                    where: {
                        ville: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    },
                    select: {
                        code_postal: true
                    }
                });
    
                if (!cityPostalCodes.length) {
                    return [];
                }
    
                // Then find studios in those postal codes
                return await prisma.studio.findMany({
                    where: {
                        AND: [
                            { statut: 'valide' },
                            {
                                code_postal: {
                                    in: cityPostalCodes.map(pc => pc.code_postal)
                                }
                            }
                        ]
                    }
                });
            }
        } catch (err) {
            throw new Error(`Error finding studios by city: ${err.message}`);
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