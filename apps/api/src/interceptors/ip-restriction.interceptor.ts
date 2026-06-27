import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AppCacheService } from '../app-cache/app-cache.service';
import { AppConfigService } from '../app-config/app-config.service';

interface IpRestrictionOptions {
  maxAttempts: number;
  duration: number; // In minutes
}

@Injectable()
export class IpRestrictionInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: AppCacheService,
    private readonly configService: AppConfigService
  ) {}
  options: IpRestrictionOptions = {
    maxAttempts: this.configService.throttle.ip.limit,
    duration: this.configService.throttle.ip.time,
  };
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    if (process.env.NODE_ENV === 'test') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const httpResponse = context.switchToHttp().getResponse();
    let ipAddress = request.headers['x-forwarded-for'];
    ipAddress = ipAddress?.split(',')?.pop();
    const key = `ip_restriction:${ipAddress}`;

    const attempts = await this.cacheService.get(key);
    const currentAttempts = parseInt(attempts as string) || 0;
    return next.handle().pipe(
      tap(async (data) => {
        if (httpResponse.statusCode >= 400) {
          httpResponse.setHeader(
            'X-RateLimit-Remaining',
            this.options.maxAttempts - currentAttempts
          );
          await this.cacheService.set(key, currentAttempts + 1, this.options.duration * 60 * 1000);
        }
        return data;
      })
    );
  }
}
