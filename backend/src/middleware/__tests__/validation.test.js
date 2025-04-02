const { validateStudioSearch, validateStudioCreation, validate } = require('../validation');
const { validationResult } = require('express-validator');

describe('Validation Middleware', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
        mockReq = {
            query: {},
            body: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
    });

    describe('validateStudioSearch', () => {
        test('should pass valid coordinates', async () => {
            mockReq.query = {
                lat: '48.8566',
                lng: '2.3522',
                radius: '5'
            };

            await Promise.all(validateStudioSearch.map(validation => validation(mockReq, mockRes, nextFunction)));
            
            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(true);
        });

        test('should fail invalid coordinates', async () => {
            mockReq.query = {
                lat: '91',
                lng: '181'
            };

            await Promise.all(validateStudioSearch.map(validation => validation(mockReq, mockRes, nextFunction)));
            
            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(false);
        });
    });

    describe('validateStudioCreation', () => {
        test('should pass valid studio data', async () => {
            mockReq.body = {
                nom: 'Test Studio',
                latitude: 48.8566,
                longitude: 2.3522,
                prix_par_heure: 50.00,
                code_postal: 75001,
                proprietaire_id: 1
            };

            await Promise.all(validateStudioCreation.map(validation => validation(mockReq, mockRes, nextFunction)));
            
            const errors = validationResult(mockReq);
            expect(errors.isEmpty()).toBe(true);
        });
    });
});