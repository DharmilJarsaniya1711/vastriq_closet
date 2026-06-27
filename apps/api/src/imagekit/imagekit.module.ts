import { Global, Module } from '@nestjs/common';
import { ImagekitService } from './imagekit.service';

@Global()
@Module({
  providers: [ImagekitService],
  exports: [ImagekitService],
})
export class ImagekitModule {}
