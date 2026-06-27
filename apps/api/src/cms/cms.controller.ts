import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AdminGuard } from '../admin/admin.guard';
import { Public } from '../auth/decorators';
import { JoiValidationPipe } from '../joi-validation-pipe/joi-validation-pipe.interceptor';
import { UtilService } from '../shared/util/util.service';
import { CreateBannerDto, UpdateBannerDto, createBannerSchema, updateBannerSchema } from './cms.dto';
import { CmsService } from './cms.service';

@ApiTags('CMS')
@Controller()
export class CmsController {
  constructor(private readonly cms: CmsService) {}

  @Public()
  @Get('cms/banners')
  @ApiOperation({ summary: 'Active banners for the storefront' })
  async publicBanners() {
    return UtilService.buildResponse({ items: await this.cms.publicBanners() });
  }

  // ---- Admin ----
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Get('admin/cms/banners')
  @ApiOperation({ summary: 'Admin: list all banners' })
  async listAll() {
    return UtilService.buildResponse({ items: await this.cms.listAll() });
  }

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post('admin/cms/banners')
  @ApiOperation({ summary: 'Admin: create a banner' })
  @UsePipes(new JoiValidationPipe(createBannerSchema, 'body'))
  async create(@Body() dto: CreateBannerDto) {
    return UtilService.buildResponse({ banner: await this.cms.create(dto) });
  }

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Patch('admin/cms/banners/:id')
  @ApiOperation({ summary: 'Admin: update a banner' })
  @UsePipes(new JoiValidationPipe(updateBannerSchema, 'body'))
  async update(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    return UtilService.buildResponse({ banner: await this.cms.update(id, dto) });
  }

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Delete('admin/cms/banners/:id')
  @ApiOperation({ summary: 'Admin: delete a banner' })
  async remove(@Param('id') id: string) {
    return UtilService.buildResponse(await this.cms.remove(id));
  }
}
