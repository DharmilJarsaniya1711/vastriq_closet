import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AdminGuard } from '../admin/admin.guard';
import { GetCurrentUserId, Public } from '../auth/decorators';
import { JoiValidationPipe } from '../joi-validation-pipe/joi-validation-pipe.interceptor';
import { UtilService } from '../shared/util/util.service';
import {
  CreateContactDto,
  ResolveContactDto,
  createContactSchema,
  resolveContactSchema,
} from './contact.dto';
import { ContactService } from './contact.service';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a "contact us" query' })
  @UsePipes(new JoiValidationPipe(createContactSchema, 'body'))
  async create(@Body() dto: CreateContactDto) {
    await this.contact.create(dto);
    return UtilService.buildResponse({ submitted: true });
  }

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Get()
  @ApiOperation({ summary: 'Admin: list contact queries (filter by status)' })
  async list(@Query('status') status?: string) {
    return UtilService.buildResponse({ items: await this.contact.list(status) });
  }

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Admin: mark a contact query resolved / new' })
  @UsePipes(new JoiValidationPipe(resolveContactSchema, 'body'))
  async resolve(
    @Param('id') id: string,
    @GetCurrentUserId() adminId: string,
    @Body() dto: ResolveContactDto
  ) {
    return UtilService.buildResponse({ query: await this.contact.resolve(id, adminId, dto) });
  }
}
