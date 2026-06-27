import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { UtilService } from './util.service';

@Global()
@Module({
  providers: [UtilService, RedisService],
  exports: [UtilService, RedisService],
})
export class UtilModule {}
