const logger = require('../logger');

describe('Logger Middleware', () => {
    let mockReq;
    let mockRes;
    let nextFunction;
    let consoleSpy;

    beforeEach(() => {
        mockReq = {
            method: 'GET',
            url: '/api/studios'
        };
        mockRes = {
            statusCode: 200,
            on: jest.fn()
        };
        nextFunction = jest.fn();
        consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    test('should call next function', () => {
        logger(mockReq, mockRes, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
    });

    test('should log request details on finish', () => {
        logger(mockReq, mockRes, nextFunction);
        
        // Simulate response finish
        const [[event, callback]] = mockRes.on.mock.calls;
        expect(event).toBe('finish');
        
        callback();
        expect(consoleSpy).toHaveBeenCalled();
    });
});