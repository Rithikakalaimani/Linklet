const express = require('express');
const router = express.Router();
const urlService = require('../services/urlService');
const { optionalAuth } = require('../middleware/auth');

/**
 * GET /api/analytics/dashboard
 * Get overall analytics dashboard data (user-specific if authenticated)
 */
router.get('/dashboard', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.userId || null;
    const analytics = await urlService.getOverallAnalytics(userId);
    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/:shortCode
 * Get analytics for a short URL
 */
router.get('/:shortCode', async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    const analytics = await urlService.getUrlAnalytics(shortCode);
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const shortUrl = `${baseUrl}/${shortCode}`;

    res.json({
      success: true,
      data: {
        ...analytics,
        shortUrl,
      },
    });
  } catch (error) {
    if (error.message === 'Short URL not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = router;
