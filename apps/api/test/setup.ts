import fetch, { Headers } from 'node-fetch';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import RedisMemoryServer from 'redis-memory-server';

export default async function globalSetup() {
  console.log('\nStarting Mongodb Memory Server for Testing...');
  const replSet = await MongoMemoryReplSet.create({
    replSet: { count: 2, storageEngine: 'wiredTiger' },
  });
  const uri = replSet.getUri();
  process.env.__DATABASE_URL = uri;
  (global as any).__MONGO_SERVER = replSet;
  console.log('Mongodb Memory Server Started.');

  console.log('Starting Redis Memory Server for Testing...');
  const redis = await RedisMemoryServer.create({});
  const host = await redis.getHost();
  const port = await redis.getPort();
  process.env.__REDIS_HOST = host;
  process.env.__REDIS_PORT = port.toString();
  (global as any).__REDIS_SERVER = redis;

  (global as any).fetch = fetch;
  (global as any).Headers = Headers;
}
