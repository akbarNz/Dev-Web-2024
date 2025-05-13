const errorHandler = require('../errorHandler');

describe('Error Handler Middleware', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
        mockReq = {};
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
    });

    test('should handle validation errors', () => {
        const err = new Error('Invalid input');
        err.name = 'ValidationError';

        errorHandler(err, mockReq, mockRes, nextFunction);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Validation Error',
            details: 'Invalid input'
        });
    });

    test('should handle Prisma errors', () => {
        const err = new Error('Database error');
        err.name = 'PrismaClientKnownRequestError';

        errorHandler(err, mockReq, mockRes, nextFunction);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith({
            error: 'Database Error',
            details: 'Invalid data provided'
        });
    });

    it('should handle errors properly', () => {
        const err = new Error('Test error');
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: 'Internal Server Error',
            message: 'Test error'
        });
    });
});