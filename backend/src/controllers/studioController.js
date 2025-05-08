const Studio = require('../models/Studio');
const { Decimal } = require('@prisma/client');

class StudioController {
    static async getStudios(req, res) {
        try {
            const { criteria, lat, lng, radius, name, city } = req.query;
            let studios;

            switch (criteria) {
                case 'radius':
                    studios = await Studio.findNearby(
                        parseFloat(lat),
                        parseFloat(lng),
                        parseFloat(radius)
                    );
                    break;
                case 'studio':
                    studios = await Studio.findByName(
                        name,
                        parseFloat(lat),
                        parseFloat(lng)
                    );
                    break;
                case 'city':
                    studios = await Studio.findByCity(city);
                    break;
                default:
                    return res.status(400).json({
                        error: 'Invalid search criteria'
                    });
            }

            res.json(studios);
        } catch (err) {
            console.error('Error in getStudios:', err);
            res.status(500).json({
                error: 'Error fetching studios'
            });
        }
    }

    static async getBestRatedStudios(req, res) {
        try {
            const { lat, lng, radius = 5, minRating = 4 } = req.query;
            
            const studios = await Studio.findNearbyBestRatedStudios(
                parseFloat(lat),
                parseFloat(lng),
                parseFloat(radius),
                parseFloat(minRating)
            );

            res.json(studios);
        } catch (err) {
            console.error('Error in getBestRatedStudios:', err);
            res.status(500).json({
                error: 'Error fetching best rated studios'
            });
        }
    }

    static async getStudioById(req, res) {
        try {
            const { id } = req.params;
            const studio = await Studio.findById(parseInt(id));

            if (!studio) {
                return res.status(404).json({
                    error: 'Studio not found'
                });
            }

            res.json(studio);
        } catch (err) {
            console.error('Error in getStudioById:', err);
            res.status(500).json({
                error: 'Error fetching studio'
            });
        }
    }

    static async createStudio(req, res) {
        try {
            const studioData = {
                ...req.body,
                prix_par_heure: new Decimal(req.body.prix_par_heure)
            };

            const studio = await Studio.create(studioData);
            res.status(201).json(studio);
        } catch (err) {
            console.error('Error in createStudio:', err);
            res.status(500).json({
                error: 'Error creating studio'
            });
        }
    }
}

module.exports = StudioController;