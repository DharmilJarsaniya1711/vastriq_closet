import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { AppConfigService } from '../app-config/app-config.service';

@Injectable()
export class AppCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly appConfigService: AppConfigService
  ) {}

  async get(key: string): Promise<unknown> {
    const data = await this.cacheManager.get(this.addPrefix(key));
    return data ? JSON.parse(data as string) : null;
  }

  async set(key: string, value: any, ttl?: number): Promise<any> {
    return this.cacheManager.set(this.addPrefix(key), JSON.stringify(value), ttl);
  }

  async del(key: string[]): Promise<any> {
    return Promise.all(key.map((k) => this.cacheManager.del(this.addPrefix(k))));
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  addPrefix(key: string) {
    return [this.appConfigService.app.name, this.appConfigService.app.env, key]
      .filter(Boolean)
      .join('-');
  }
}
