const Redis = require('ioredis');
require('dotenv').config();

// Use REDIS_URL from environment, fallback to localhost for development
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

console.log('🔍 REDIS_URL exists:', !!process.env.REDIS_URL);
console.log('🔗 Connecting to Redis...');

// Create Redis client with URL
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  tls: redisUrl.startsWith('rediss') ? {} : undefined, // Enable TLS for Upstash
  retryStrategy: (times) => {
    if (times > 10) {
      console.error('❌ Redis retry limit reached');
      return null;
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err) => {
    console.log('Redis reconnecting:', err.message);
    return true;
  }
});

// Event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('ready', () => {
  console.log('✅ Redis is ready to accept commands');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

module.exports = redis;
