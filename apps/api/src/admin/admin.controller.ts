import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { UtilService } from '../shared/util/util.service';
import { AdminGuard } from './admin.guard';
import { AdminService, UsersFilter } from './admin.service';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('stats/overview')
  @ApiOperation({ summary: 'Dashboard KPIs + charts data' })
  async overview() {
    return UtilService.buildResponse(await this.admin.overview());
  }

  @Get('users')
  @ApiOperation({ summary: 'List users with filter' })
  async users(@Query() query: UsersFilter) {
    return UtilService.buildResponse(await this.admin.listUsers(query));
  }

  @Get('outfits')
  @ApiOperation({ summary: 'List outfits with filter' })
  async outfits(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return UtilService.buildResponse(
      await this.admin.listOutfits(status, Number(page) || 1, Number(limit) || 20)
    );
  }
}
