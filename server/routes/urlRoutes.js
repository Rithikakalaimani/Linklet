const express = require('express');
const router = express.Router();
const urlService = require('../services/urlService');
const QRCode = require('qrcode');
const { getRedisClient } = require('../config/redis');
const { CACHE_TTL } = require('../config/constants');
const { optionalAuth } = require('../middleware/auth');

/**
 * POST /api/url/shorten
 * Create a shortened URL (supports both authenticated and anonymous users)
 */
router.post('/shorten', optionalAuth, async (req, res, next) => {
  try {
    const { originalUrl, customAlias, expiresInDays } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: 'originalUrl is required' });
    }

    const userId = req.userId || null;
    const url = await urlService.createShortUrl(originalUrl, customAlias, expiresInDays, userId);
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const shortUrl = `${baseUrl}/${url.shortCode}`;

    res.status(201).json({
      success: true,
      data: {
        shortCode: url.shortCode,
        shortUrl,
        originalUrl: url.originalUrl,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Note: The redirect route is handled at the root level in server/index.js
// This keeps short URLs clean: http://localhost:5000/abc123

/**
 * GET /api/url/:shortCode/qr
 * Generate QR code for short URL
 */
router.get('/:shortCode/qr', async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    
    // Set CORS headers first
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.setHeader('Access-Control-Allow-Origin', frontendUrl);
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    // First verify the URL exists
    try {
      await urlService.getOriginalUrl(shortCode);
    } catch (error) {
      if (error.message === 'Short URL not found' || error.message === 'URL has expired') {
        return res.status(404).json({ error: error.message });
      }
      throw error;
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const shortUrl = `${baseUrl}/${shortCode}`;

    // Check cache for QR code if Redis is available
    const redisClient = getRedisClient();
    if (redisClient) {
      try {
        const cacheKey = `qr:${shortCode}`;
        const cachedQR = await redisClient.get(cacheKey);
        if (cachedQR) {
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
          return res.send(Buffer.from(cachedQR, 'base64'));
        }
      } catch (redisError) {
        // Continue to generate if cache fails
        console.warn('Redis cache error for QR code:', redisError.message);
      }
    }

    // Generate QR code directly as buffer (more efficient)
    const qrCodeBuffer = await QRCode.toBuffer(shortUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Convert buffer to base64 for caching
    const base64Data = qrCodeBuffer.toString('base64');

    // Cache QR code (24 hours) if Redis is available
    if (redisClient) {
      try {
        const cacheKey = `qr:${shortCode}`;
        await redisClient.setEx(cacheKey, CACHE_TTL, base64Data);
      } catch (redisError) {
        // Continue even if caching fails
        console.warn('Failed to cache QR code:', redisError.message);
      }
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(qrCodeBuffer);
  } catch (error) {
    if (error.message === 'Short URL not found' || error.message === 'URL has expired') {
      return res.status(404).json({ error: error.message });
    }
    console.error('QR code generation error:', error);
    next(error);
  }
});

/**
 * GET /api/url/:shortCode/info
 * Get URL information without redirecting
 */
router.get('/:shortCode/info', async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const originalUrl = await urlService.getOriginalUrl(shortCode);
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const shortUrl = `${baseUrl}/${shortCode}`;

    res.json({
      success: true,
      data: {
        shortCode,
        shortUrl,
        originalUrl,
      },
    });
  } catch (error) {
    if (error.message === 'Short URL not found' || error.message === 'URL has expired') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * DELETE /api/url/:shortCode
 * Delete a short URL (soft delete)
 */
router.delete('/:shortCode', async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    await urlService.deleteUrl(shortCode);

    res.json({
      success: true,
      message: 'URL deleted successfully',
    });
  } catch (error) {
    if (error.message === 'Short URL not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = router;
