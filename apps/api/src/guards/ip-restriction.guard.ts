import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AppCacheService } from '../app-cache/app-cache.service';
import { AppConfigService } from '../app-config/app-config.service';

interface IpRestrictionOptions {
  maxAttempts: number;
  duration: number; // In minutes
}

@Injectable()
export class IpRestrictionGuard implements CanActivate {
  constructor(
    private readonly cacheService: AppCacheService,
    private readonly configService: AppConfigService
  ) {}
  options: IpRestrictionOptions = {
    maxAttempts: this.configService.throttle.ip.limit,
    duration: this.configService.throttle.ip.time,
  };
  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (process.env.NODE_ENV === 'test') {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    let ipAddress = request.headers['x-forwarded-for'];
    ipAddress = ipAddress?.split(',')?.pop();
    const key = `ip_restriction:${ipAddress}`;

    const attempts = await this.cacheService.get(key);
    const currentAttempts = parseInt(attempts as string) || 0;

    if (currentAttempts >= this.options.maxAttempts) {
      response.setHeader('X-RateLimit-Remaining', 0);
      response.status(HttpStatus.TOO_MANY_REQUESTS).send({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests',
      });
      return false;
    }
    return true;
  }
}
