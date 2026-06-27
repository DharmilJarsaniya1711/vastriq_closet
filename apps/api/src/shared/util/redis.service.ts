import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { AppConfigService } from '../../app-config/app-config.service';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor(private readonly appConfigService: AppConfigService) {
    const { redis } = this.appConfigService;

    const options: RedisOptions = {
      username: redis.username,
      password: redis.password,
    };

    this.client = new Redis(redis.port, redis.host, options);
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  async setData(
    key: string,
    data: any,
    expiry: number = null // expiry in seconds
  ) {
    key = this.addPrefix(key);
    return new Promise((res, rej) => {
      if (expiry) {
        this.client.set(key, JSON.stringify(data), 'EX', expiry, (err, result) => {
          if (err) rej(err);
          res(result);
        });
      } else {
        this.client.set(key, JSON.stringify(data), (err, result) => {
          if (err) rej(err);
          res(result);
        });
      }
    });
  }

  async getData(key: string): Promise<string> {
    key = this.addPrefix(key);
    return new Promise((res, rej) => {
      this.client.get(key, (err, result) => {
        if (err) rej(err);
        res(result);
      });
    });
  }

  async deleteData(key: string): Promise<number> {
    key = this.addPrefix(key);
    return new Promise((res, rej) => {
      this.client.del(key, (err, result) => {
        if (err) rej(err);
        res(result);
      });
    });
  }

  addPrefix(key: string) {
    return [this.appConfigService.app.name, this.appConfigService.app.env, key]
      .filter(Boolean)
      .join('-');
  }
}
