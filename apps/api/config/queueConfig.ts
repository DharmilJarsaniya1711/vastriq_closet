import { BullModuleOptions, SharedBullConfigurationFactory } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../src/app-config/app-config.service';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
  constructor(private readonly appConfigService: AppConfigService) {}

  createSharedConfiguration(): BullModuleOptions {
    if (process.env.NODE_ENV === 'test') {
      return {
        redis: {
          host: process.env.__REDIS_HOST,
          port: Number(process.env.__REDIS_PORT),
        },
      };
    }

    return {
      redis: this.appConfigService.redis,
    };
  }
}
