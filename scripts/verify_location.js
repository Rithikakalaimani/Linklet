const mongoose = require('mongoose');
const { connectDB } = require('../server/config/database');
const { connectRedis, getRedisClient } = require('../server/config/redis');
const urlService = require('../server/services/urlService');

async function verifyLocationTracking() {
  console.log('🔍 Starting Location Tracking Verification...');

  try {
    await connectDB();
    await connectRedis();
    const redisClient = getRedisClient();

    const testUrl = 'https://www.example.com';
    const testAlias = `loc-${Date.now().toString().slice(-6)}`;

    // 1. Create URL
    console.log('\n1️⃣  Creating test URL...');
    const url = await urlService.createShortUrl(testUrl, testAlias);
    console.log(`   Created: ${url.shortCode}`);

    // 2. Simulate Click with US IP (Google DNS)
    console.log('\n2️⃣  Simulating click with US IP (8.8.8.8)...');
    await urlService.trackClick(url.shortCode, {
      ip: '8.8.8.8', // Google Public DNS (US)
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      referer: 'direct'
    });

    // 3. Verify Analytics
    console.log('\n3️⃣  Verifying stored location data...');
    const analytics = await urlService.getUrlAnalytics(url.shortCode);
    const lastClick = analytics.clicks[analytics.clicks.length - 1];

    console.log('   Last Click Data:', {
      ip: lastClick.ip,
      country: lastClick.country,
      region: lastClick.region
    });

    if (lastClick.country === 'US') {
      console.log('   ✅ Country detected correctly: US');
    } else {
      console.error(`   ❌ Country detection failed. Expected US, got ${lastClick.country}`);
    }

    // 4. Cleanup
    console.log('\n4️⃣  Cleaning up...');
    await urlService.deleteUrl(url.shortCode);
    console.log('   ✅ Test URL deleted');

  } catch (error) {
    console.error('❌ Verification Failed:', error);
  } finally {
    const redisClient = getRedisClient();
    if (redisClient) await redisClient.quit();
    await mongoose.disconnect();
    process.exit(0);
  }
}

verifyLocationTracking();
