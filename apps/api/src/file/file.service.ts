import { InjectQueue } from '@nestjs/bull';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Upload, UploadDriver, Prisma } from '@prisma/client';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { TUniqueId } from '../shared/types/type';
import * as path from 'path';
import * as fs from 'fs';
import { ImagekitService } from '../imagekit/imagekit.service';
import { allowedFileTypes } from './types';
import { AppConfigService } from '../app-config/app-config.service';
import * as FileType from 'file-type';
import { DELETE_FILE_QUEUE, PREVIEW_UPLOAD_QUEUE } from './queue.config';

@Injectable()
export class FileService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly imagekitService: ImagekitService,
    private readonly appConfigService: AppConfigService,
    @InjectQueue(PREVIEW_UPLOAD_QUEUE) private thumbQueue: Queue,
    @InjectQueue(DELETE_FILE_QUEUE) private deleteQueue: Queue
  ) {}

  async upload(files: Array<Express.Multer.File>, preview = false, userId?: TUniqueId) {
    await this.sanityCheck(files);

    const fileRecords = await Promise.all(
      files.map(async (file) => await this.fileRecordGenerator(file, preview, userId))
    );

    if (preview) {
      await this.thumbQueue.addBulk(fileRecords.map((file) => ({ data: file })));
    }

    return fileRecords;
  }

  async deleteFile(id: TUniqueId) {
    const file = await this.prismaService.upload.findFirst({
      where: {
        id,
      },
    });
    if (!file) throw new NotFoundException('File not found');
    await this.deleteQueue.add(file);
    return file;
  }

  /** Below function(s) is(are) not used in controller  */
  async fileRecordGenerator(
    file: Express.Multer.File,
    preview: boolean,
    createdById?: TUniqueId
  ): Promise<Upload> {
    const driver = this.appConfigService.fileUpload.driver as UploadDriver;
    const input: Prisma.UploadCreateInput = {
      driver,
      originalFileKey: file.originalname,
    };

    if (driver === UploadDriver.LOCAL) {
      input.fileKey = file.filename;
    }

    if (driver === UploadDriver.IMAGEKIT) {
      const { fileId, url } = await this.imagekitService.uploadFile(file.path, file.filename);
      const filePath = path.resolve('uploads', file.filename);
      if (!preview) await fs.promises.unlink(filePath);
      input.fileKey = file.filename;
      input.fileId = fileId;
      input.url = url;
    }

    if (createdById) input.createdBy = { connect: { id: createdById } };

    return this.prismaService.upload.create({ data: input });
  }

  async sanityCheck(files: Express.Multer.File[]) {
    const checks = await Promise.all(
      files.map(async (file) => this.magicNumberCheck(path.resolve(file.path)))
    );

    if (checks.some((check) => !check)) {
      await Promise.allSettled(files.map((file) => fs.promises.unlink(path.resolve(file.path))));
      throw new ForbiddenException('Invalid file type');
    }
  }

  async magicNumberCheck(path: string) {
    const stream = fs.createReadStream(path);
    const fileTypeResult = await FileType.fromStream(stream);

    if (fileTypeResult && allowedFileTypes.includes(fileTypeResult.mime.split('/')[0])) {
      return true;
    }

    throw new UnsupportedMediaTypeException(
      `File type is not matching: ${allowedFileTypes.join(', ')}`
    );
  }
}
