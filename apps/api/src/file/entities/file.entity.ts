import { ApiProperty } from '@nestjs/swagger';
import { Upload } from '@prisma/client';
import { IApiResponse } from '../../shared/util/util.service';

export class FileEntity implements IApiResponse<Upload> {
  @ApiProperty()
  data: Upload;

  @ApiProperty()
  message?: string;
}
