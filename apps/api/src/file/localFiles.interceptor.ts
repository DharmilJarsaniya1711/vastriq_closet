import { FilesInterceptor } from '@nestjs/platform-express';
import { Injectable, mixin, NestInterceptor, Type } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

interface LocalFilesInterceptorOptions {
  fieldName: string;
  path?: string;
  maxCount:number,
  storage:MulterOptions['storage'],
  fileFilter?: MulterOptions['fileFilter'];
  limits?: MulterOptions['limits'];
}

function LocalFilesInterceptor(
  options: LocalFilesInterceptorOptions,
): Type<NestInterceptor> {
  @Injectable()
  class Interceptor implements NestInterceptor {
    filesInterceptor: NestInterceptor;
    constructor() {
      const multerOptions: MulterOptions = {
        storage:options.storage,
        fileFilter: options.fileFilter,
        limits: options.limits,
      };

      this.filesInterceptor = new (FilesInterceptor(
        options.fieldName,
        options.maxCount,
        multerOptions,
      ))();
    }

    intercept(...args: Parameters<NestInterceptor['intercept']>) {
      return this.filesInterceptor.intercept(...args);
    }
  }
  return mixin(Interceptor);
}

export default LocalFilesInterceptor;
