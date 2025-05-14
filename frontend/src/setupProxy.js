const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    // Proxy pour les routes /reserv
    app.use(
        '/reserv',
        createProxyMiddleware({
            target: 'http://localhost:5001',
            changeOrigin: true,
        })
    );
    
    // Proxy pour les routes /api
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://localhost:5001',
            changeOrigin: true,
        })
    );
};