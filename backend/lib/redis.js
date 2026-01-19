import Redis from "ioredis";
import dotenv from "dotenv"
dotenv.config()

// Create Redis connection with error handling
let redis = null;

try {
  if (process.env.REDIS_UPSTASH_URL) {
    redis = new Redis(process.env.REDIS_UPSTASH_URL, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    
    redis.on('error', (err) => {
      console.warn('Redis connection error:', err.message);
    });
    
    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
  } else {
    console.log('⚠️  Redis URL not provided, Redis features disabled');
  }
} catch (error) {
  console.warn('Redis initialization failed:', error.message);
}

export { redis };