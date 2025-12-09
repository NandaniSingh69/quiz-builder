const redis = require('./config/redis');

// Example: Caching
async function getCachedData(key) {
  if (!redis) return null; // Skip if Redis not available
  
  try {
    return await redis.get(key);
  } catch (err) {
    console.warn('Redis get failed, continuing without cache:', err.message);
    return null;
  }
}

async function setCachedData(key, value) {
  if (!redis) return; // Skip if Redis not available
  
  try {
    await redis.set(key, value, 'EX', 3600);
  } catch (err) {
    console.warn('Redis set failed, continuing without cache:', err.message);
  }
}
