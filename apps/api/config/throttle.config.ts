import { ThrottlerAsyncOptions, ThrottlerModuleOptions } from "@nestjs/throttler";
import { AppConfigService } from "../src/app-config/app-config.service";

const conf = (appConfigService: AppConfigService): ThrottlerModuleOptions => {
  return {
    throttlers: [
      {
        ttl: appConfigService.throttle.default.time * 60 * 1000,
        limit: appConfigService.throttle.default.limit,
      },
    ],
  }
};

export const throttleConfig: ThrottlerAsyncOptions = {
  inject: [AppConfigService],
  useFactory: (appConfigService: AppConfigService) => conf(appConfigService),
}