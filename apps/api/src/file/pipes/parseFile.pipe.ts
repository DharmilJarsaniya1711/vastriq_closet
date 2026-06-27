import {
  Injectable,
  PipeTransform,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';

@Injectable()
export class ParseFile implements PipeTransform {
  transform(files: Express.Multer.File[]): Express.Multer.File[] {
    if (files === undefined || files === null) {
      throw new BadRequestException('Files cannot be empty');
    }

    if (Array.isArray(files) && files.length === 0) {
      throw new BadRequestException('Files cannot be empty');
    }

    if (
      files.some((file) => {
        return file.size && file.size > 5 * 1024 * 1024;
      })
    ) {
      //max file size 5MB
      throw new PayloadTooLargeException('File size too large');
    }

    return files;
  }
}
