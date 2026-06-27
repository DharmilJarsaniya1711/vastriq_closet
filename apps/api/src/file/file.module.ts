import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { BullModule } from '@nestjs/bull';
import { DeleteFileProcessor, ThumbnailProcessor } from './file.processor';
import { DELETE_FILE_QUEUE, PREVIEW_UPLOAD_QUEUE } from './queue.config';

@Module({
  controllers: [FileController],
  providers: [FileService, ThumbnailProcessor, DeleteFileProcessor],
  imports: [
    BullModule.registerQueue({ name: PREVIEW_UPLOAD_QUEUE }),
    BullModule.registerQueue({ name: DELETE_FILE_QUEUE }),
  ],
})
export class FileModule {}
