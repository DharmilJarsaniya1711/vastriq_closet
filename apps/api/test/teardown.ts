import { MongoMemoryReplSet } from 'mongodb-memory-server';
import RedisMemoryServer from 'redis-memory-server';

export default async function globalTeardown() {
  const mongoInstance: MongoMemoryReplSet = (global as any).__MONGO_SERVER;
  await mongoInstance.stop();

  const redisInstance: RedisMemoryServer = (global as any).__REDIS_SERVER;
  await redisInstance.stop();
}
