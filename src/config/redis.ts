import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  throw new Error("REDIS_URL is not defined");
};

// Use a global variable to prevent multiple connections during hot reloads
const globalForRedis = global as unknown as { redis: Redis };

export const redis = globalForRedis.redis || new Redis(getRedisUrl());

if (process.env.NODE_NODE !== "production") globalForRedis.redis = redis;
