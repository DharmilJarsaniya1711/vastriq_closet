import { PartialType } from '@nestjs/swagger';
import { FilesUploadDto } from './filesUpload.dto';

export class UpdateFileDto extends PartialType(FilesUploadDto) {}
