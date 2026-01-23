const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const urlRoutes = require('./routes/urlRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const urlService = require('./services/urlService');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware - configure helmet to allow images
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now to fix QR code issue
  crossOriginResourcePolicy: false, // Allow cross-origin images
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting (exclude QR code endpoint)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply rate limiting to API routes except QR codes
app.use('/api/', (req, res, next) => {
  if (req.path.includes('/qr')) {
    return next(); // Skip rate limiting for QR codes
  }
  limiter(req, res, next);
});

// Routes
app.use('/api/url', urlRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root-level redirect route for short URLs (must be after /api routes)
app.get('/:shortCode', async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    
    // Skip if it's a known route or static file request
    const skipRoutes = ['health', 'api', 'favicon.ico', 'robots.txt', 'sitemap.xml'];
    if (skipRoutes.includes(shortCode) || shortCode.includes('.')) {
      return next();
    }

    // Validate short code format (alphanumeric, 3-20 chars)
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(shortCode)) {
      return res.status(404).json({ error: 'Invalid short code format' });
    }

    const originalUrl = await urlService.getOriginalUrl(shortCode);
    
    // Track click (non-blocking - don't fail redirect if tracking fails)
    urlService.trackClick(shortCode, {
      ip: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
      referer: req.get('referer') || 'direct',
    }).catch(err => {
      // Log but don't fail the redirect
      console.error('Error tracking click:', err.message);
    });

    // Redirect with 301 (permanent redirect)
    res.redirect(301, originalUrl);
  } catch (error) {
    // Handle specific error cases
    if (error.message === 'Short URL not found' || 
        error.message === 'URL has expired' ||
        error.message === 'URL is not active') {
      return res.status(404).json({ 
        error: error.message,
        shortCode: req.params.shortCode 
      });
    }
    
    // Log error for debugging
    console.error('Redirect error for shortCode:', req.params.shortCode, error.message);
    
    // Return user-friendly error
    res.status(500).json({ 
      error: 'Failed to redirect',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Note: In Vercel, static files and React routing are handled by vercel.json
// This Express middleware is only for local development
if ((process.env.NODE_ENV === 'production' || process.env.VERCEL) && !process.env.VERCEL) {
  const path = require('path');
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  // Handle React routing - return all non-API requests to React app
  app.get('*', (req, res, next) => {
    // Skip API routes and short code redirects
    if (req.path.startsWith('/api')) {
      return next();
    }
    // Check if it's a short code (3-20 alphanumeric chars)
    if (/^\/[a-zA-Z0-9_-]{3,20}$/.test(req.path)) {
      return next(); // Let the redirect handler process it
    }
    // Serve React app for all other routes
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server (only if not in Vercel/serverless environment)
const startServer = async () => {
  try {
    // Try to connect to databases, but don't fail if they're not available
    const dbConnected = await connectDB();
    const redisConnected = await connectRedis();
    
    // Start server even if databases aren't connected
    // Listen on all interfaces to allow proxy connections
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
      if (!dbConnected) {
        console.log(`⚠️  Warning: MongoDB not connected. Some features may not work.`);
      }
      if (!redisConnected) {
        console.log(`⚠️  Warning: Redis not connected. Caching is disabled.`);
      }
      console.log(`\n✅ Server is ready! Visit http://localhost:${PORT}/health to test.\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if not in Vercel/serverless environment
// In Vercel, the app is exported and handled by serverless functions
if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
  startServer();
}

// Export app for Vercel serverless functions
module.exports = app;
