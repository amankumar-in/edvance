const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.API_PORT || 3000;
const HOST = process.env.API_HOST || '0.0.0.0'; // Listen on all network interfaces

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API Gateway is running' });
});

// Proxy configuration - will be expanded as we build other services
// Example: app.use('/auth', createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }));

// Start the server
app.listen(PORT, HOST, () => {
  console.log(`API Gateway running at http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`For network access: http://${process.env.NETWORK_IP || '192.168.1.23'}:${PORT}`);
});
