import { CacheOptions } from '@nestjs/cache-manager';
import { AppCacheDriver, AppConfigService } from '../src/app-config/app-config.service';
import { getCacheDriverStore } from './cache-store.config';

const getConfig = async (
  appConfigService: AppConfigService
): Promise<CacheOptions<Record<string, any>>> => {
  const driver = appConfigService.cache.driver as AppCacheDriver;
  const store = await getCacheDriverStore(driver, appConfigService.cache.store);

  return {
    store,
    ttl: appConfigService.cache.defaultTTL,
  };
};

export const appCacheConfig = {
  inject: [AppConfigService],
  useFactory: (appConfigService: AppConfigService) => getConfig(appConfigService),
};
