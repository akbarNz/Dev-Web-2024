const Studio = require('../models/Studio');
const { Decimal } = require('@prisma/client');

class StudioController {
    // Get nearby studios
    static async getNearbyStudios(req, res) {
        try {
            const { lat, lng, radius = 5 } = req.query;
            
            // Validate inputs
            if (!lat || !lng) {
                return res.status(400).json({ 
                    error: 'Latitude and longitude are required' 
                });
            }

            const studios = await Studio.findNearby(
                parseFloat(lat),
                parseFloat(lng),
                parseFloat(radius)
            );

            res.json(studios);
        } catch (err) {
            console.error('Error in getNearbyStudios:', err);
            res.status(500).json({ 
                error: 'Error fetching nearby studios' 
            });
        }
    }

    // Get studio by ID
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

    // Create new studio
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