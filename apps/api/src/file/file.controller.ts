import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UnsupportedMediaTypeException,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { UploadDriver } from '@prisma/client';
import * as crypto from 'crypto';
import { Response } from 'express';
import * as fs from 'fs';
import { mkdir } from 'fs';
import * as mime from 'mime-types';
import { diskStorage } from 'multer';
import * as path from 'path';
import { AppConfigService } from '../app-config/app-config.service';
import LocalFilesInterceptor from './localFiles.interceptor';
import { GetCurrentUserId, Public } from '../auth/decorators';
import { ImagekitService } from '../imagekit/imagekit.service';
import { TUniqueId } from '../shared/types/type';
import { UtilService } from '../shared/util/util.service';
import { FilesUploadDto } from './dto/filesUpload.dto';
import { FileEntity } from './entities/file.entity';
import { FileService } from './file.service';
import { ParseFile } from './pipes';
import { allowedFileTypes } from './types';

@ApiTags('Files')
@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly imagekitService: ImagekitService,
    private readonly appConfigService: AppConfigService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Short-lived ImageKit auth params for browser-side direct upload' })
  @Get('imagekit-auth')
  async imagekitAuth() {
    return UtilService.buildResponse(this.imagekitService.getAuthenticationParameters());
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Universal file upload API' })
  @ApiCreatedResponse({
    type: FileEntity,
  })
  @Post('upload')
  @UseInterceptors(
    LocalFilesInterceptor({
      fieldName: 'files',
      path: '/uploads',
      maxCount:10,
      storage:diskStorage({
        destination(req, file, callback) {
          const dest = `./uploads`;
          mkdir(dest, { recursive: true }, () => {
            callback(null, dest);
          });
        },
        filename(req, file, callback) {
          const ext = mime.extension(file.mimetype);
          const name = `${crypto.randomBytes(32).toString('hex')}.${ext}`;
          callback(null, name);
        },
      }),
      fileFilter: (req, file, callback) =>{
        if (allowedFileTypes.some((ft) => file.mimetype.includes(ft))) {
          callback(null, true);
        } else {
          callback(
            new UnsupportedMediaTypeException(
              `File type is not matching: ${allowedFileTypes.join(', ')}`,
            ),
            false,
          );
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'List of files to upload',
    type: FilesUploadDto,
  })
  @ApiQuery({
    name: 'preview',
    description: 'if preview = "true" it will generate a preview picture',
    required: false,
  })
  async upload(
    @UploadedFiles(ParseFile) files: Array<Express.Multer.File>,
    @GetCurrentUserId() currentUserId: TUniqueId,
    @Query('preview') preview?: string,
  ) {
    const allRecords = await this.fileService.upload(files, preview === 'true', currentUserId);
    return UtilService.buildResponse(allRecords);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete saved files' })
  @ApiParam({
    description: 'id of the file',
    name: 'id',
  })
  @Delete('delete/:id')
  async deleteFile(@Param('id') id: TUniqueId) {
    const file = await this.fileService.deleteFile(id);
    return UtilService.buildResponse(file);
  }

  @Public()
  @ApiOperation({ summary: 'Key of the file' })
  @ApiParam({
    description: 'key of the file',
    name: 'key',
  })
  @Get('/:key')
  async getFile(@Param('key') key: string, @Res() res: Response) {
    const driver = this.appConfigService.fileUpload.driver;
    if (driver === UploadDriver.LOCAL) {
      const filePath = path.resolve('uploads', key);
      try {
        await fs.promises.stat(filePath);
        const file = fs.createReadStream(filePath);
        file.pipe(res);
      } catch (error) {
        if (error.code === 'ENOENT') throw new NotFoundException('File not found!');
        throw new BadRequestException('Something went wrong!');
      }
    } else if (driver === UploadDriver.IMAGEKIT) {
      // ImageKit files are served from its CDN — redirect to the transformed URL.
      res.redirect(`${this.imagekitService.urlEndpoint}/${key}`);
    }
  }
}
