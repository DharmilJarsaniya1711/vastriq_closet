import { ConfigModuleOptions } from '@nestjs/config';
import { UploadDriver } from '@prisma/client';
import * as Joi from 'joi';
import { AppCacheDriver } from '../app-config/app-config.service';

const CacheManagerRedisStoreSchema = Joi.string().when('APP_CACHE_DRIVER', {
  is: AppCacheDriver.REDIS,
  then: Joi.required(),
});

export const configOptions: ConfigModuleOptions = {
  envFilePath: '.env',
  isGlobal: true,

  validationSchema: Joi.object({
    // API
    APP_NAME: Joi.string()
      .required()
      .regex(/^[a-zA-Z0-9_]*$/)
      .min(3)
      .max(30),
    APP_ENV: Joi.string()
      .regex(/^[A-Za-z_]+$/)
      .required(),
    APP_PORT: Joi.string().required(),
    APP_HOST: Joi.string().required(),
    // DB
    DATABASE_URL: Joi.string().required(),
    // REDIS
    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.string().required(),
    // JWT
    AT_SECRET: Joi.string().required(),
    RT_SECRET: Joi.string().required(),
    // SMTP
    SMTP_HOST: Joi.string().required(),
    SMTP_PORT: Joi.string().required(),
    SMTP_USERNAME: Joi.string().required(),
    SMTP_PASSWORD: Joi.string().required(),
    SMTP_FROM: Joi.string().required(),

    // UPLOADS
    FILE_UPLOAD_DRIVER: Joi.string().valid(UploadDriver.LOCAL, UploadDriver.IMAGEKIT).required(),
    IMAGEKIT_PUBLIC_KEY: Joi.string().allow('').optional(),
    IMAGEKIT_PRIVATE_KEY: Joi.string().allow('').optional(),
    IMAGEKIT_URL_ENDPOINT: Joi.string().allow('').optional(),

    // Throttle request
    DEFAULT_THROTTLE_TIME: Joi.number().required(),
    DEFAULT_THROTTLE_LIMIT: Joi.number().required(),
    IP_THROTTLE_TIME: Joi.number().positive().integer().required(),
    IP_THROTTLE_LIMIT: Joi.number().positive().integer().required(),
    OTP_EXPIRY_TIME: Joi.number().integer().required(),

    //CORS
    CORS_ALLOWED_ORIGINS: Joi.string()
      .required()
      .custom((value: string, helpers: any) => {
        const origins = value.split(',');

        if (origins.length === 0 || origins[0] === '') {
          return helpers.error('any.invalid');
        }

        return origins;
      }),

    // Cache
    APP_CACHE_DRIVER: Joi.string()
      .default(AppCacheDriver.IN_MEMORY)
      .valid(AppCacheDriver.IN_MEMORY, AppCacheDriver.REDIS),
    APP_CACHE_DEFAULT_TTL: Joi.number().positive().required(),

    APP_CACHE_REDIS_STORE_HOST: CacheManagerRedisStoreSchema,
    APP_CACHE_REDIS_STORE_PORT: CacheManagerRedisStoreSchema,
    APP_CACHE_REDIS_STORE_USERNAME: CacheManagerRedisStoreSchema,
    APP_CACHE_REDIS_STORE_PASSWORD: CacheManagerRedisStoreSchema.allow(''),
  }).unknown(),
  validationOptions: {
    abortEarly: true,
  },
};
