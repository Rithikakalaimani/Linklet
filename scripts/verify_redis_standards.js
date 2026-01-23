const mongoose = require('mongoose');
const { connectDB } = require('../server/config/database');
const { connectRedis, getRedisClient } = require('../server/config/redis');
const urlService = require('../server/services/urlService');
const Url = require('../server/models/Url');

async function verifyRedisStandards() {
  console.log('🔍 Starting Redis Standards Verification...');

  try {
    await connectDB();
    await connectRedis();
    const redisClient = getRedisClient();
    
    if (!redisClient) {
      throw new Error('Redis not connected');
    }

    const testUrl = 'https://www.example.com';
    const testAlias = `redis-${Date.now().toString().slice(-6)}`;

    // 1. Test Cache Miss & Population (Write)
    console.log('\n1️⃣  Testing Cache Population (Cache Miss -> DB -> Cache)...');
    const url = await urlService.createShortUrl(testUrl, testAlias);
    console.log(`   Created URL: ${url.shortCode}`);
    
    // Verify it's in Redis (createShortUrl populates it optimistically)
    let cachedValue = await redisClient.get(`url:${url.shortCode}`);
    if (cachedValue) {
      console.log('   ✅ Cache populated immediately (Write-Through optimization)');
    } else {
      console.log('   ⚠️ Cache not populated on create (Acceptable if Cache-Aside only)');
    }

    // 2. Test Cache Hit
    console.log('\n2️⃣  Testing Cache Hit...');
    // Manually spy on Redis GET
    const originalGet = redisClient.get;
    let getCallCount = 0;
    /*
    // Note: We can't easily spy on the internal redisClient instance without mocking,
    // so we'll infer from performance or side effects, or just trust the code logic we reviewed.
    // For this script, we'll verify the data is correct and comes from Redis by modifying Redis directly.
    */
    
    // Modify Redis cache to prove it's being read
    const fakeUrl = 'https://www.cached-version.com';
    await redisClient.setEx(`url:${url.shortCode}`, 3600, JSON.stringify({
      originalUrl: fakeUrl,
      isActive: true,
      expiresAt: null
    }));

    const retrievedUrl = await urlService.getOriginalUrl(url.shortCode);
    if (retrievedUrl === fakeUrl) {
      console.log('   ✅ Cache HIT: Retrieved value from Redis (modified value)');
    } else {
      console.error(`   ❌ Cache MISS: Retrieved ${retrievedUrl} instead of cached ${fakeUrl}`);
    }

    // Restore correct value
    await redisClient.del(`url:${url.shortCode}`);
    // Trigger Cache Miss -> DB -> Cache
    await urlService.getOriginalUrl(url.shortCode);
    
    // 3. Test TTL (Expiration)
    console.log('\n3️⃣  Testing TTL (Time-To-Live)...');
    const ttl = await redisClient.ttl(`url:${url.shortCode}`);
    console.log(`   Current TTL: ${ttl} seconds`);
    if (ttl > 0 && ttl <= 86400) {
      console.log('   ✅ TTL is set correctly (<= 24 hours)');
    } else {
      console.error(`   ❌ TTL is invalid: ${ttl}`);
    }

    // 4. Test Invalidation (Delete)
    console.log('\n4️⃣  Testing Cache Invalidation...');
    await urlService.deleteUrl(url.shortCode);
    const cachedAfterDelete = await redisClient.get(`url:${url.shortCode}`);
    if (!cachedAfterDelete) {
      console.log('   ✅ Cache Invalidated: Key removed from Redis after delete');
    } else {
      console.error('   ❌ Cache NOT Invalidated: Key still exists');
    }

  } catch (error) {
    console.error('❌ Verification Failed:', error);
  } finally {
    const redisClient = getRedisClient();
    if (redisClient) await redisClient.quit();
    await mongoose.disconnect();
    process.exit(0);
  }
}

verifyRedisStandards();
