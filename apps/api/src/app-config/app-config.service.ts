import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum AppCacheDriver {
  IN_MEMORY = 'IN_MEMORY',
  REDIS = 'REDIS',
}

// This may need to be refactored if we want to support more than just redis.
export type ICacheStoreConfig = Readonly<{
  host: string;
  port: number;
  username: string;
  password?: string;
  tls?: Record<string, unknown>;
}>;

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  // Managed Redis providers (e.g. Upstash) require TLS. Enable with REDIS_TLS=true.
  private readonly redisTls =
    this.configService.get<string>('REDIS_TLS') === 'true' ? { tls: {} } : {};

  readonly app = {
    port: this.configService.get<number>('APP_PORT'),
    host: this.configService.get<string>('APP_HOST'),
    name: this.configService.get<string>('APP_NAME'),
    env: this.configService.get<string>('APP_ENV'),
  };

  readonly db = {
    url: this.configService.get<string>('DATABASE_URL'),
  };

  readonly redis = {
    host: this.configService.get<string>('REDIS_HOST'),
    port: this.configService.get<number>('REDIS_PORT'),
    username: this.configService.get<string>('REDIS_USERNAME'),
    password: this.configService.get<string>('REDIS_PASSWORD'),
    ...this.redisTls,
  };

  readonly smtp = {
    host: this.configService.get<string>('SMTP_HOST'),
    port: this.configService.get<number>('SMTP_PORT'),
    username: this.configService.get<string>('SMTP_USERNAME'),
    password: this.configService.get<string>('SMTP_PASSWORD'),
    from: this.configService.get<string>('SMTP_FROM'),
  };

  readonly jwt = {
    atSecret: this.configService.get<string>('AT_SECRET'),
    rtSecret: this.configService.get<string>('RT_SECRET'),
  };

  readonly imagekit = {
    publicKey: this.configService.get<string>('IMAGEKIT_PUBLIC_KEY'),
    privateKey: this.configService.get<string>('IMAGEKIT_PRIVATE_KEY'),
    urlEndpoint: this.configService.get<string>('IMAGEKIT_URL_ENDPOINT'),
  };

  readonly fileUpload = {
    driver: this.configService.get<string>('FILE_UPLOAD_DRIVER'),
  };

  readonly throttle = {
    default: {
      time: this.configService.get<number>('DEFAULT_THROTTLE_TIME'),
      limit: this.configService.get<number>('DEFAULT_THROTTLE_LIMIT'),
    },
    ip: {
      time: this.configService.get<number>('IP_THROTTLE_TIME'),
      limit: this.configService.get<number>('IP_THROTTLE_LIMIT'),
    },
  };
  readonly otp = {
    expiry: this.configService.get<number>('OTP_EXPIRY_TIME'),
  };

  readonly cors = {
    allowedOrigins: this.configService.get<string>('CORS_ALLOWED_ORIGINS'),
  };

  readonly cache = {
    defaultTTL: this.configService.get<number>('APP_CACHE_DEFAULT_TTL'),

    driver: this.configService.get<string>('APP_CACHE_DRIVER'),

    store: {
      host: this.configService.get<string>('APP_CACHE_REDIS_STORE_HOST'),
      port: this.configService.get<number>('APP_CACHE_REDIS_STORE_PORT'),
      username: this.configService.get<string>('APP_CACHE_REDIS_STORE_USERNAME'),
      password: this.configService.get<string>('APP_CACHE_REDIS_STORE_PASSWORD'),
      ...this.redisTls,
    },
  };
}
