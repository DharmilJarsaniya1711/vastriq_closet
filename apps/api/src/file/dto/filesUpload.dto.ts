import { ApiProperty } from '@nestjs/swagger';

// We already have defined Pipe in parseFile.pipe.ts to validate files
export class FilesUploadDto {
  @ApiProperty({
    description:
      'Only images and videos are allowed. At most 10 files can be uploaded at a time. Maximum file size allowed is 5MB for each file.',
    type: 'array',
    items: { type: 'string', format: 'binary', required: ['files'] },
    required: true,
  })
  files: any[];
}
