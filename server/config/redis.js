const redis = require('redis');

let redisClient = null;
let isConnected = false;

const connectRedis = async () => {
  try {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        connectTimeout: 2000, // 2 second timeout
        reconnectStrategy: false, // Don't auto-reconnect
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    // Set up error handler before connecting
    redisClient.on('error', (err) => {
      // Only log once, not repeatedly
      if (isConnected) {
        console.error('Redis Client Error:', err.message);
        isConnected = false;
      }
    });

    redisClient.on('connect', () => {
      isConnected = true;
      console.log('✅ Redis Client Connected');
    });

    // Try to connect with timeout
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 2000)
      )
    ]);

    isConnected = true;
    console.log('✅ Redis connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Redis connection error:', error.message);
    console.error('⚠️  Server will start but caching will be disabled.');
    console.error('💡 To fix:');
    console.error('   1. Make sure Redis is running: redis-server');
    console.error('   2. Or update REDIS_HOST and REDIS_PORT in .env');
    isConnected = false;
    redisClient = null;
    return false;
  }
};

const getRedisClient = () => {
  if (!redisClient || !isConnected) {
    return null;
  }
  return redisClient;
};

const isRedisConnected = () => isConnected;

module.exports = {
  connectRedis,
  getRedisClient,
  isRedisConnected,
};
