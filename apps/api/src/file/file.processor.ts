import { Processor, Process } from '@nestjs/bull';
import { Upload, UploadDriver } from '@prisma/client';
import { Job } from 'bull';
import * as Ffmpeg from 'ffmpeg';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import * as mime from 'mime-types';
import * as crypto from 'crypto';
import { ImagekitService } from '../imagekit/imagekit.service';
import { AppConfigService } from '../app-config/app-config.service';
import { DELETE_FILE_QUEUE, PREVIEW_UPLOAD_QUEUE } from './queue.config';

//NOTE: This is the solution to a known issue[Failing to read large files #915]: https://github.com/oliver-moran/jimp/issues/915#issuecomment-967163466
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Jimp = require('jimp');
const cachedJpegDecoder: any = Jimp.decoders['image/jpeg'];
Jimp.decoders['image/jpeg'] = (data) => {
  const userOpts = { maxMemoryUsageInMB: 1024 };
  return cachedJpegDecoder(data, userOpts);
};

@Processor(PREVIEW_UPLOAD_QUEUE)
export class ThumbnailProcessor {
  constructor(
    private readonly imagekitService: ImagekitService,
    private readonly prismaService: PrismaService,
    private readonly appConfigService: AppConfigService
  ) {}

  @Process()
  async genPreview(job: Job<Upload>) {
    const { data } = job;

    const filePath = path.resolve('uploads', data.fileKey);
    const mimeType = mime.lookup(filePath) as string;
    const photoThumbName = `${crypto.randomBytes(32).toString('hex')}.png`;
    const videoThumbName = `${crypto.randomBytes(32).toString('hex')}`;
    const targetDirectoryPath = path.resolve('uploads');
    const previewFilePath = path.resolve(targetDirectoryPath, photoThumbName);
    const driver = this.appConfigService.fileUpload.driver as UploadDriver;

    if (['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      Jimp.read(filePath)
        .then(async (img) => {
          img
            .quality(60)
            .resize(200, 200)
            .write(previewFilePath, async (err) => {
              if (!err) {
                if (this.appConfigService.fileUpload.driver === UploadDriver.IMAGEKIT) {
                  await fs.promises.unlink(filePath);
                }

                if (driver === UploadDriver.IMAGEKIT) {
                  const { url } = await this.imagekitService.uploadFile(
                    previewFilePath,
                    photoThumbName
                  );
                  await this.prismaService.upload.update({
                    where: { id: data.id },
                    data: {
                      previewKey: url,
                    },
                  });
                  try {
                    await fs.promises.unlink(previewFilePath);
                  } catch (error) {
                    console.error(error);
                  }
                } else {
                  await this.prismaService.upload.update({
                    where: { id: data.id },
                    data: {
                      previewKey: photoThumbName,
                    },
                  });
                }
              }
            });
        })
        .catch(() => {
          // do nothing
        });
    } else if (['video/mp4', 'video/webm'].includes(mimeType)) {
      const videoProcess = new Ffmpeg(filePath);
      const video = await videoProcess;
      await video.fnExtractFrameToJPG(targetDirectoryPath, {
        start_time: Math.round((1000 * video.metadata.duration.seconds) / 3),
        frame_rate: 1,
        number: 1,
        file_name: videoThumbName,
      });

      if (this.appConfigService.fileUpload.driver === UploadDriver.IMAGEKIT) {
        await fs.promises.unlink(filePath);
      }

      const generatedFileName = `${videoThumbName}_1.jpg`;
      const generatedFilePath = path.resolve(targetDirectoryPath, generatedFileName);
      if (driver === UploadDriver.IMAGEKIT) {
        const { url: previewKey } = await this.imagekitService.uploadFile(
          generatedFilePath,
          generatedFileName
        );
        await this.prismaService.upload.update({
          where: { id: data.id },
          data: {
            previewKey,
          },
        });
        try {
          await fs.promises.unlink(previewFilePath);
        } catch (error) {
          console.error(error);
          // do nothing
        }
      } else {
        await this.prismaService.upload.update({
          where: { id: data.id },
          data: {
            previewKey: generatedFileName,
          },
        });
      }
    }
  }
}

@Processor(DELETE_FILE_QUEUE)
export class DeleteFileProcessor {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly appConfigService: AppConfigService
  ) {}
  @Process()
  async deleteFile(job: Job<Upload>) {
    const { data } = job;
    const driver = this.appConfigService.fileUpload.driver as UploadDriver;

    await this.prismaService.upload.delete({
      where: {
        id: data.id,
      },
    });

    const unlinkFilePath = path.resolve('uploads', data.fileKey);
    const unlinkFilePreviewPath = path.resolve('uploads', data.previewKey);
    if (driver === UploadDriver.LOCAL) {
      await Promise.allSettled([fs.promises.unlink(unlinkFilePath), unlinkFilePreviewPath]);
    } else if (driver === UploadDriver.IMAGEKIT) {
      // TODO: delete from ImageKit via fileId
    }
  }
}
