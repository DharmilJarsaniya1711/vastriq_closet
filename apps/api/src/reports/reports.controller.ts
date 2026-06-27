import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AdminGuard } from '../admin/admin.guard';
import { GetCurrentUserId } from '../auth/decorators';
import { JoiValidationPipe } from '../joi-validation-pipe/joi-validation-pipe.interceptor';
import { UtilService } from '../shared/util/util.service';
import { CreateReportDto, ResolveReportDto, createReportSchema, resolveReportSchema } from './reports.dto';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'File a trust & safety report' })
  @UsePipes(new JoiValidationPipe(createReportSchema, 'body'))
  async create(@GetCurrentUserId() userId: string, @Body() dto: CreateReportDto) {
    return UtilService.buildResponse({ report: await this.reports.create(userId, dto) });
  }

  @UseGuards(AdminGuard)
  @Get()
  @ApiOperation({ summary: 'Admin: list reports (filter by status)' })
  async list(@Query('status') status?: string) {
    return UtilService.buildResponse({ items: await this.reports.list(status) });
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Admin: action / resolve a report' })
  @UsePipes(new JoiValidationPipe(resolveReportSchema, 'body'))
  async resolve(
    @Param('id') id: string,
    @GetCurrentUserId() adminId: string,
    @Body() dto: ResolveReportDto
  ) {
    return UtilService.buildResponse({ report: await this.reports.resolve(id, adminId, dto) });
  }
}
