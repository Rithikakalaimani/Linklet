const redis = require("redis");

let redisClient = null;
let isConnected = false;

const connectRedis = async () => {
  try {
    let clientOptions;

    // Upstash and other cloud Redis often provide REDIS_URL (use rediss:// for TLS)
    if (process.env.REDIS_URL) {
      clientOptions = {
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: false,
        },
      };
    } else {
      // Use REDIS_HOST, REDIS_PORT, REDIS_PASSWORD (with TLS for cloud providers like Upstash)
      const useTLS = process.env.REDIS_TLS === "true" || process.env.REDIS_TLS === "1";
      clientOptions = {
        socket: {
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT || "6379", 10),
          connectTimeout: 5000,
          reconnectStrategy: false,
          ...(useTLS && { tls: true }),
        },
        password: process.env.REDIS_PASSWORD || undefined,
      };
    }

    redisClient = redis.createClient(clientOptions);

    // Set up error handler before connecting
    redisClient.on("error", (err) => {
      // Only log once, not repeatedly
      if (isConnected) {
        console.error("Redis Client Error:", err.message);
        isConnected = false;
      }
    });

    redisClient.on("connect", () => {
      isConnected = true;
      console.log("✅ Redis Client Connected");
    });

    // Try to connect with timeout
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), 2000),
      ),
    ]);

    isConnected = true;
    console.log("✅ Redis connected successfully");
    return true;
  } catch (error) {
    console.error("❌ Redis connection error:", error.message);
    console.error("⚠️  Server will start but caching will be disabled.");
    console.error("💡 To fix:");
    console.error("   1. For Upstash: use REDIS_URL (rediss://default:PASSWORD@host:6379) or set REDIS_TLS=true");
    console.error("   2. Or set REDIS_HOST, REDIS_PORT, REDIS_PASSWORD in .env");
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
