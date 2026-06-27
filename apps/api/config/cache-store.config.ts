import { CacheManagerOptions } from '@nestjs/common';
import { redisStore } from 'cache-manager-ioredis-yet';
import { AppCacheDriver, ICacheStoreConfig } from '../src/app-config/app-config.service';

export async function getCacheDriverStore(
  driver: AppCacheDriver,
  config: ICacheStoreConfig
): Promise<CacheManagerOptions['store']> {
  if (driver === AppCacheDriver.REDIS) {
    return await redisStore(config);
  }

  /**
   * NOTE: Currently only redis is supported. Most of the other stores are outdated. You may need to create a custom cache store for them.
   * Check https://github.com/jaredwray/cache-manager#store-engines
   *
   */
}
