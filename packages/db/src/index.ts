import { MongoClient } from 'mongodb';
import { createClient as createRedis } from 'redis';
import { cfg } from '@config/reality-sim';

let mongoClient: MongoClient | null = null;
export async function mongo() {
  if (!mongoClient) {
    mongoClient = new MongoClient(cfg.MONGO_URI);
    await mongoClient.connect();
  }
  return mongoClient.db();
}

let redisClient: any;
export async function redis() {
  if (!redisClient) {
    redisClient = createRedis({ url: cfg.REDIS_URL });
    await redisClient.connect();
  }
  return redisClient;
}
