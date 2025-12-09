const Redis = require('ioredis');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.warn('⚠️  REDIS_URL not set. Redis features disabled.');
  module.exports = null;
} else {
  console.log('🔗 Connecting to Redis...');

  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      if (times > 20) {
        console.error('❌ Redis max retries reached');
        return null;
      }
      return Math.min(Math.pow(2, times) * 100, 3000);
    },
    tls: {},
    connectTimeout: 10000,
    lazyConnect: false,
    keepAlive: 30000,
    family: 4
  });

  let isConnected = false;

  redis.on('connect', () => {
    if (!isConnected) {
      console.log('✅ Redis connected');
      isConnected = true;
    }
  });

  redis.on('ready', () => {
    console.log('✅ Redis ready');
  });

  redis.on('error', (err) => {
    if (!err.message.includes('ECONNRESET')) {
      console.error('❌ Redis error:', err.message);
    }
  });

  redis.on('close', () => {
    console.log('⚠️  Redis closed');
    isConnected = false;
  });

  module.exports = redis;
}
