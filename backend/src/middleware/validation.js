const { validationResult, check } = require('express-validator');

const validateStudioSearch = [
    check('lat').isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    check('lng').isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    check('radius').optional()
        .isFloat({ min: 0, max: 50 })
        .withMessage('Radius must be between 0 and 50 km'),
];

const validateStudioCreation = [
    check('nom').notEmpty().trim()
        .withMessage('Studio name is required'),
    check('latitude').isFloat({ min: -90, max: 90 })
        .withMessage('Invalid latitude'),
    check('longitude').isFloat({ min: -180, max: 180 })
        .withMessage('Invalid longitude'),
    check('prix_par_heure').isFloat({ min: 0 })
        .withMessage('Price must be positive'),
    check('code_postal').isInt()
        .withMessage('Invalid postal code'),
    check('proprietaire_id').isInt()
        .withMessage('Invalid owner ID'),
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    validateStudioSearch,
    validateStudioCreation,
    validate
};