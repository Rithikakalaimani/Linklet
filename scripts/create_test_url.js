const mongoose = require('mongoose');
const { connectDB } = require('../server/config/database');
const { connectRedis, getRedisClient } = require('../server/config/redis');
const urlService = require('../server/services/urlService');

async function createTestUrl() {
  try {
    await connectDB();
    await connectRedis();
    
    const testUrl = 'https://www.google.com';
    const testAlias = `test-${Date.now().toString().slice(-6)}`;
    
    const url = await urlService.createShortUrl(testUrl, testAlias);
    console.log(url.shortCode); // Output ONLY the short code for easy piping
    
    const redisClient = getRedisClient();
    if (redisClient) await redisClient.quit();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createTestUrl();
