const { validationResult, check } = require('express-validator');

const validateStudioSearch = [
    check('criteria')
        .isIn(['radius', 'studio', 'city'])
        .withMessage('Invalid search criteria'),
    check('lat')
        .if((value, { req }) => ['radius', 'studio'].includes(req.query.criteria))
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    check('lng')
        .if((value, { req }) => ['radius', 'studio'].includes(req.query.criteria))
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    check('radius')
        .if((value, { req }) => req.query.criteria === 'radius')
        .isFloat({ min: 0, max: 50 })
        .withMessage('Radius must be between 0 and 50 km'),
    check('name')
        .if((value, { req }) => req.query.criteria === 'studio')
        .notEmpty()
        .withMessage('Studio name is required for name search'),
    check('city')
        .if((value, { req }) => req.query.criteria === 'city')
        .notEmpty()
        .withMessage('City is required for city search'),
];

const validateBestRatedSearch = [
    check('lat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Invalid latitude'),
    check('lng')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Invalid longitude'),
    check('radius')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Radius must be positive'),
    check('minRating')
        .optional()
        .isFloat({ min: 0, max: 5 })
        .withMessage('Rating must be between 0 and 5')
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
    validate,
    validateBestRatedSearch
};