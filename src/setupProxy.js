const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/reserv',
        createProxyMiddleware({
            target: 'http://localhost:5001',
            changeOrigin: true,
        })
    );
};
