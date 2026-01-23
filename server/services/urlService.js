const Url = require('../models/Url');
const { encode, generateRandomCode } = require('../utils/base62');
const { validateUrl, validateAlias } = require('../utils/urlValidator');
const { getRedisClient } = require('../config/redis');
const { CACHE_TTL } = require('../config/constants');
const { parseUserAgent } = require('../utils/userAgentParser');
const geoip = require('geoip-lite');

/**
 * Generate a unique short code
 */
const generateUniqueShortCode = async () => {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    // Strategy 1: Use counter-based encoding (more predictable)
    // Get the current count from a counter collection or use timestamp
    const timestamp = Date.now();
    const shortCode = encode(timestamp).substring(0, 7); // Use first 7 chars

    // Strategy 2: Random generation (fallback)
    // const shortCode = generateRandomCode(7);

    const exists = await Url.findOne({ shortCode });
    if (!exists) {
      return shortCode;
    }
    attempts++;
  }

  // Fallback to random if counter-based fails
  let randomCode;
  do {
    randomCode = generateRandomCode(7);
  } while (await Url.findOne({ shortCode: randomCode }));

  return randomCode;
};

/**
 * Create a shortened URL
 */
const createShortUrl = async (originalUrl, customAlias = null, expiresInDays = null, userId = null) => {
  // Validate URL
  const urlValidation = await validateUrl(originalUrl);
  if (!urlValidation.valid) {
    throw new Error(urlValidation.error);
  }

  // Validate custom alias if provided
  if (customAlias) {
    const aliasValidation = validateAlias(customAlias);
    if (!aliasValidation.valid) {
      throw new Error(aliasValidation.error);
    }

    // Check if alias already exists
    const existingAlias = await Url.findOne({ customAlias, isActive: true });
    if (existingAlias) {
      throw new Error('Custom alias already exists');
    }
  }

  // Check if URL already exists (optional optimization)
  const existingUrl = await Url.findOne({ originalUrl, isActive: true });
  if (existingUrl && !customAlias) {
    return existingUrl;
  }

  // Generate short code
  const shortCode = customAlias || await generateUniqueShortCode();

  // Calculate expiration date
  let expiresAt = null;
  if (expiresInDays) {
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  }

  // Create URL document
  const url = new Url({
    shortCode,
    originalUrl,
    customAlias: customAlias || null,
    expiresAt,
    userId: userId || null,
    analytics: {
      clicks: [],
      lastAccessed: null,
    },
  });

  await url.save();

  // Cache the new URL (non-blocking - continue even if cache fails)
  try {
    const redisClient = getRedisClient();
    if (redisClient) {
      const cacheKey = `url:${shortCode}`;
      await redisClient.setEx(
        cacheKey,
        CACHE_TTL,
        JSON.stringify({
          originalUrl: url.originalUrl,
          isActive: url.isActive,
          expiresAt: url.expiresAt,
        })
      );
    }
  } catch (cacheError) {
    // Log but don't fail the request if caching fails
    console.warn('Failed to cache URL:', cacheError.message);
  }

  return url;
};

/**
 * Get original URL by short code (with caching)
 */
const getOriginalUrl = async (shortCode) => {
  const redisClient = getRedisClient();
  const cacheKey = `url:${shortCode}`;

  // Try cache first if Redis is available (cache hit)
  if (redisClient) {
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const urlData = JSON.parse(cached);
        
        // Check if expired
        if (urlData.expiresAt && new Date(urlData.expiresAt) < new Date()) {
          await redisClient.del(cacheKey);
          throw new Error('URL has expired');
        }

        if (!urlData.isActive) {
          throw new Error('URL is not active');
        }

        return urlData.originalUrl;
      }
    } catch (cacheError) {
      // If cache read fails, continue to database
      console.warn('Cache read failed, falling back to database:', cacheError.message);
    }
  }

  // Cache miss or Redis unavailable - fallback to database
  const url = await Url.findOne({ shortCode, isActive: true });
  
  if (!url) {
    throw new Error('Short URL not found');
  }

  // Check expiration
  if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
    url.isActive = false;
    await url.save();
    throw new Error('URL has expired');
  }

  // Cache the result for future requests (non-blocking)
  if (redisClient) {
    try {
      await redisClient.setEx(
        cacheKey,
        CACHE_TTL,
        JSON.stringify({
          originalUrl: url.originalUrl,
          isActive: url.isActive,
          expiresAt: url.expiresAt,
        })
      );
    } catch (cacheError) {
      console.warn('Failed to cache URL:', cacheError.message);
    }
  }

  return url.originalUrl;
};

/**
 * Track click analytics
 */
const trackClick = async (shortCode, clickData) => {
  const url = await Url.findOne({ shortCode });
  
  if (!url) {
    return;
  }

  // Parse user agent using ua-parser-js
  const userAgentInfo = parseUserAgent(clickData.userAgent || 'unknown');
  
  // Update click count
  url.clickCount += 1;
  url.analytics.lastAccessed = new Date();
  const clickRecord = {
    timestamp: new Date(),
    ip: clickData.ip || 'unknown',
    userAgent: clickData.userAgent || 'unknown',
    referer: clickData.referer || 'direct',
    browser: userAgentInfo.browser,
    os: userAgentInfo.os,
    device: userAgentInfo.device,
    browserVersion: userAgentInfo.browserVersion || null,
    osVersion: userAgentInfo.osVersion || null,
    deviceModel: userAgentInfo.deviceModel || null,
    country: null,
    region: null,
  };

  // Get location from IP
  const ip = clickData.ip;
  if (ip && ip !== 'unknown' && ip !== '127.0.0.1' && ip !== '::1') {
    const geo = geoip.lookup(ip);
    if (geo) {
      clickRecord.country = geo.country;
      clickRecord.region = geo.region;
    }
  }

  url.analytics.clicks.push(clickRecord);

  // Keep only last 1000 clicks to prevent document bloat
  if (url.analytics.clicks.length > 1000) {
    url.analytics.clicks = url.analytics.clicks.slice(-1000);
  }

  await url.save();
};

/**
 * Calculate unique visitors from clicks
 */
const calculateUniqueVisitors = (clicks) => {
  const uniqueIPs = new Set();
  clicks.forEach(click => {
    if (click.ip && click.ip !== 'unknown') {
      uniqueIPs.add(click.ip);
    }
  });
  return uniqueIPs.size;
};

/**
 * Calculate visits and visitors by day
 */
const calculateVisitsAndVisitorsByDay = (clicks) => {
  const byDay = {};
  
  clicks.forEach(click => {
    const day = new Date(click.timestamp).toISOString().split('T')[0];
    if (!byDay[day]) {
      byDay[day] = {
        visits: 0,
        visitors: new Set(),
      };
    }
    byDay[day].visits += 1;
    if (click.ip && click.ip !== 'unknown') {
      byDay[day].visitors.add(click.ip);
    }
  });

  // Convert Set to count
  const result = {};
  Object.keys(byDay).forEach(day => {
    result[day] = {
      visits: byDay[day].visits,
      visitors: byDay[day].visitors.size,
    };
  });
  
  return result;
};

/**
 * Get URL analytics
 */
const getUrlAnalytics = async (shortCode) => {
  const url = await Url.findOne({ shortCode });
  
  if (!url) {
    throw new Error('Short URL not found');
  }

  const uniqueVisitors = calculateUniqueVisitors(url.analytics.clicks);
  const visitsAndVisitorsByDay = calculateVisitsAndVisitorsByDay(url.analytics.clicks);

  return {
    shortCode: url.shortCode,
    originalUrl: url.originalUrl,
    clickCount: url.clickCount,
    uniqueVisitors,
    createdAt: url.createdAt,
    expiresAt: url.expiresAt,
    lastAccessed: url.analytics.lastAccessed,
    clicks: url.analytics.clicks,
    // Additional analytics
    clicksByDay: calculateClicksByDay(url.analytics.clicks),
    clicksByReferer: calculateClicksByReferer(url.analytics.clicks),
    clicksByBrowser: calculateClicksByBrowser(url.analytics.clicks),
    clicksByOS: calculateClicksByOS(url.analytics.clicks),
    clicksByDevice: calculateClicksByDevice(url.analytics.clicks),
    clicksByCountry: calculateClicksByCountry(url.analytics.clicks),
    clicksByRegion: calculateClicksByRegion(url.analytics.clicks),
    visitsAndVisitorsByDay,
  };
};

/**
 * Calculate clicks grouped by day
 */
const calculateClicksByDay = (clicks) => {
  const byDay = {};
  clicks.forEach(click => {
    const day = new Date(click.timestamp).toISOString().split('T')[0];
    byDay[day] = (byDay[day] || 0) + 1;
  });
  return byDay;
};

/**
 * Calculate clicks grouped by referer
 */
const calculateClicksByReferer = (clicks) => {
  const byReferer = {};
  clicks.forEach(click => {
    const referer = click.referer || 'direct';
    byReferer[referer] = (byReferer[referer] || 0) + 1;
  });
  return byReferer;
};

/**
 * Calculate clicks grouped by browser
 */
const calculateClicksByBrowser = (clicks) => {
  const byBrowser = {};
  clicks.forEach(click => {
    let browser = click.browser;
    // Parse if not already parsed (backward compatibility)
    if (!browser && click.userAgent) {
      const parsed = parseUserAgent(click.userAgent);
      browser = parsed.browser;
    }
    browser = browser || 'Unknown';
    byBrowser[browser] = (byBrowser[browser] || 0) + 1;
  });
  return byBrowser;
};

/**
 * Calculate clicks grouped by OS
 */
const calculateClicksByOS = (clicks) => {
  const byOS = {};
  clicks.forEach(click => {
    let os = click.os;
    // Parse if not already parsed (backward compatibility)
    if (!os && click.userAgent) {
      const parsed = parseUserAgent(click.userAgent);
      os = parsed.os;
    }
    os = os || 'Unknown';
    byOS[os] = (byOS[os] || 0) + 1;
  });
  return byOS;
};

/**
 * Calculate clicks grouped by device type
 */
const calculateClicksByDevice = (clicks) => {
  const byDevice = {};
  clicks.forEach(click => {
    let device = click.device;
    // Parse if not already parsed (backward compatibility)
    if (!device && click.userAgent) {
      const parsed = parseUserAgent(click.userAgent);
      device = parsed.device;
    }
    device = device || 'Unknown';
    byDevice[device] = (byDevice[device] || 0) + 1;
  });
  return byDevice;
};

/**
 * Calculate clicks grouped by country
 */
const calculateClicksByCountry = (clicks) => {
  const byCountry = {};
  clicks.forEach(click => {
    const country = click.country || 'Unknown';
    byCountry[country] = (byCountry[country] || 0) + 1;
  });
  return byCountry;
};

/**
 * Calculate clicks grouped by region
 */
const calculateClicksByRegion = (clicks) => {
  const byRegion = {};
  clicks.forEach(click => {
    const region = click.region || 'Unknown';
    byRegion[region] = (byRegion[region] || 0) + 1;
  });
  return byRegion;
};

/**
 * Get overall analytics dashboard data
 */
const getOverallAnalytics = async (userId = null) => {
  const query = { isActive: true };
  if (userId) {
    query.userId = userId;
  }
  const urls = await Url.find(query).sort({ createdAt: -1 }).limit(100);
  
  // Calculate overall stats
  const totalUrls = await Url.countDocuments(query);
  const totalClicks = await Url.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$clickCount' } } }
  ]);
  
  const totalClicksCount = totalClicks.length > 0 ? totalClicks[0].total : 0;
  
  // Get recent URLs with their stats
  const recentUrls = urls.map(url => ({
    shortCode: url.shortCode,
    originalUrl: url.originalUrl,
    clickCount: url.clickCount,
    createdAt: url.createdAt,
    lastAccessed: url.analytics.lastAccessed,
    expiresAt: url.expiresAt,
  }));
  
  // Calculate clicks by day (aggregate all URLs)
  const allClicks = [];
  urls.forEach(url => {
    if (url.analytics && url.analytics.clicks) {
      allClicks.push(...url.analytics.clicks);
    }
  });
  
  const clicksByDay = calculateClicksByDay(allClicks);
  const clicksByReferer = calculateClicksByReferer(allClicks);
  
  // Get top performing URLs
  const topUrls = await Url.find(query)
    .sort({ clickCount: -1 })
    .limit(10)
    .select('shortCode originalUrl clickCount createdAt analytics.lastAccessed');
  
  return {
    totalUrls,
    totalClicks: totalClicksCount,
    recentUrls,
    clicksByDay,
    clicksByReferer,
    topUrls: topUrls.map(url => ({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clickCount: url.clickCount,
      createdAt: url.createdAt,
      lastAccessed: url.analytics?.lastAccessed,
    })),
  };
};

/**
 * Delete a short URL (soft delete - mark as inactive)
 */
const deleteUrl = async (shortCode) => {
  const url = await Url.findOne({ shortCode });
  
  if (!url) {
    throw new Error('Short URL not found');
  }

  // Soft delete - mark as inactive
  url.isActive = false;
  await url.save();

  // Remove from cache
  try {
    const redisClient = getRedisClient();
    const cacheKey = `url:${shortCode}`;
    const qrCacheKey = `qr:${shortCode}`;
    await redisClient.del(cacheKey);
    await redisClient.del(qrCacheKey);
  } catch (cacheError) {
    // Continue even if cache deletion fails
    console.warn('Failed to delete from cache:', cacheError.message);
  }

  return url;
};

module.exports = {
  createShortUrl,
  getOriginalUrl,
  trackClick,
  getUrlAnalytics,
  getOverallAnalytics,
  deleteUrl,
};
