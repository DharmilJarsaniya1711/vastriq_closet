import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { appCacheConfig } from '../../config/cache.config';
import { AppCacheService } from './app-cache.service';

@Module({
  imports: [CacheModule.registerAsync(appCacheConfig)],
  providers: [AppCacheService],
  exports: [AppCacheService],
})
export class AppCacheModule {}
