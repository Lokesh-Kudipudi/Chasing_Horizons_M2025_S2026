const { createClient } = require("redis");

let redisUrl = process.env.REDIS_URL;

// Derive the standard TCP Redis URL (rediss://) if Upstash REST variables are provided
if (!redisUrl && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const host = process.env.UPSTASH_REDIS_REST_URL
    .replace("https://", "")
    .replace("http://", "")
    .split("/")[0];
  const port = host.includes(":") ? "" : ":6379";
  redisUrl = `rediss://default:${process.env.UPSTASH_REDIS_REST_TOKEN}@${host}${port}`;
}

if (!redisUrl) {
  redisUrl = "redis://localhost:6379";
}

const isTls = redisUrl.startsWith("rediss://");

const client = createClient({
  url: redisUrl,
  socket: isTls ? {
    tls: true,
    rejectUnauthorized: false
  } : undefined
});

client.on("error", (err) => {
  console.error("Redis client connection error:", err);
});

// Auto-connect to standard TCP Redis
client.connect()
  .then(() => {
    console.log(" Connected to Redis via TCP");
  })
  .catch((err) => {
    console.error(" Failed to connect to TCP Redis:", err.message);
  });

// Backward compatible wrapper for other modules expecting Upstash REST client behavior
const redis = {
  get: async (key) => {
    try {
      const data = await client.get(key);
      if (!data) return null;
      try {
        return JSON.parse(data);
      } catch (e) {
        return data; // Return raw string if not JSON
      }
    } catch (err) {
      console.error(`Redis GET error for key ${key}:`, err.message);
      return null;
    }
  },
  set: async (key, value, options = {}) => {
    try {
      const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
      const redisOptions = {};
      if (options.ex) {
        redisOptions.EX = options.ex;
      } else if (options.EX) {
        redisOptions.EX = options.EX;
      }
      await client.set(key, stringValue, redisOptions);
      return "OK";
    } catch (err) {
      console.error(`Redis SET error for key ${key}:`, err.message);
      return null;
    }
  },
  del: async (key) => {
    try {
      await client.del(key);
      return 1;
    } catch (err) {
      console.error(`Redis DEL error for key ${key}:`, err.message);
      return 0;
    }
  },
  ping: async () => {
    try {
      return await client.ping();
    } catch (err) {
      return "PONG (fallback)";
    }
  },
  client
};

// Distributed lock (Mutex) helpers
const acquireLock = async (lockKey, ttlMs = 5000) => {
  try {
    const identifier = Math.random().toString(36).substring(2) + Date.now();
    // SET lockKey identifier NX PX ttlMs
    const result = await client.set(lockKey, identifier, {
      NX: true,
      PX: ttlMs
    });
    if (result === "OK") {
      return identifier;
    }
    return null;
  } catch (error) {
    console.error(`Error acquiring lock for key ${lockKey}:`, error.message);
    return null;
  }
};

const releaseLock = async (lockKey, identifier) => {
  try {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await client.eval(script, {
      keys: [lockKey],
      arguments: [identifier]
    });
    return true;
  } catch (error) {
    console.error(`Error releasing lock for key ${lockKey}:`, error.message);
    return false;
  }
};

const storeOTP = async (email, otp, expirationMinutes = 5) => {
  try {
    const key = `otp:${email}`;
    const expirationSeconds = expirationMinutes * 60;
    await redis.set(key, otp, { ex: expirationSeconds });
    console.log(`OTP Stored: key="${key}", otp="${otp}", expiry=${expirationSeconds}s`);
    return { success: true };
  } catch (error) {
    console.error("Error storing OTP:", error);
    return { success: false };
  }
};

const getOTP = async (email) => {
  try {
    const key = `otp:${email}`;
    const otp = await redis.get(key);
    console.log(`OTP Retrieved: key="${key}", otp="${otp}"`);
    return otp;
  } catch (error) {
    console.error("Error retrieving OTP:", error);
    return null;
  }
};

const deleteOTP = async (email) => {
  try {
    const key = `otp:${email}`;
    await redis.del(key);
    return { success: true };
  } catch (error) {
    console.error("Error deleting OTP:", error);
    return { success: false };
  }
};

module.exports = { redis, acquireLock, releaseLock, storeOTP, getOTP, deleteOTP };
