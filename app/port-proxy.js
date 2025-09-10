const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Proxy all requests to port 8082 to port 8080
app.use('/api', createProxyMiddleware({ 
  target: 'http://localhost:8080',
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    '^/api': '/api'
  }
}));

// Start the proxy server on port 8082
app.listen(8082, () => {
  console.log('Port forwarding proxy server started on port 8082 -> forwarding to 8080');
});
