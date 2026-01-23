const mongoose = require('mongoose');
const { connectDB } = require('../server/config/database');
const { connectRedis, getRedisClient } = require('../server/config/redis');
const urlService = require('../server/services/urlService');
const Url = require('../server/models/Url');

async function verifyRedirection() {
  console.log('🔍 Starting Redirection Verification...');

  // 1. Connect to DB and Redis
  try {
    await connectDB();
    await connectRedis();
    console.log('✅Connected to MongoDB and Redis');
  } catch (error) {
    console.error('❌ Failed to connect to services:', error.message);
    process.exit(1);
  }

  const redisClient = getRedisClient();
  const testUrl = 'https://www.google.com';
  const testAlias = `test-${Date.now()}`;

  try {
    // 2. Create Short URL
    console.log('\n📝 Creating test short URL...');
    const url = await urlService.createShortUrl(testUrl, testAlias);
    console.log(`✅ Created: ${url.shortCode} -> ${url.originalUrl}`);

    // 3. Verify Redis Cache (Write)
    if (redisClient) {
      const cached = await redisClient.get(`url:${url.shortCode}`);
      if (cached) {
        console.log('✅ URL cached in Redis immediately after creation');
      } else {
        console.warn('⚠️ URL NOT found in Redis after creation');
      }
    }

    // 4. Simulate Redirect (Read)
    console.log('\n🔄 Simulating redirect (getOriginalUrl)...');
    const original = await urlService.getOriginalUrl(url.shortCode);
    
    if (original === testUrl) {
      console.log('✅ getOriginalUrl returned correct URL');
    } else {
      console.error(`❌ getOriginalUrl returned WRONG URL: ${original}`);
    }

    // 5. Verify Analytics
    console.log('\n📊 Tracking click...');
    await urlService.trackClick(url.shortCode, {
      ip: '127.0.0.1',
      userAgent: 'TestScript/1.0',
      referer: 'direct'
    });

    const analytics = await urlService.getUrlAnalytics(url.shortCode);
    if (analytics.clickCount > 0) {
      console.log(`✅ Analytics tracked. Click count: ${analytics.clickCount}`);
    } else {
      console.error('❌ Analytics NOT tracked');
    }

    // 6. Cleanup
    console.log('\n🧹 Cleaning up...');
    await urlService.deleteUrl(url.shortCode);
    console.log('✅ Test URL deleted');

  } catch (error) {
    console.error('❌ Verification Failed:', error);
  } finally {
    if (redisClient) await redisClient.quit();
    await mongoose.disconnect();
    process.exit(0);
  }
}

verifyRedirection();
