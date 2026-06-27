import { Body, Controller, Get, Patch, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AdminGuard } from '../admin/admin.guard';
import { JoiValidationPipe } from '../joi-validation-pipe/joi-validation-pipe.interceptor';
import { UtilService } from '../shared/util/util.service';
import { UpdateSettingsDto, updateSettingsSchema } from './settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin/settings')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Admin: get platform settings' })
  async get() {
    return UtilService.buildResponse({ settings: await this.settings.get() });
  }

  @Patch()
  @ApiOperation({ summary: 'Admin: update platform settings' })
  @UsePipes(new JoiValidationPipe(updateSettingsSchema, 'body'))
  async update(@Body() dto: UpdateSettingsDto) {
    return UtilService.buildResponse({ settings: await this.settings.update(dto) });
  }
}
