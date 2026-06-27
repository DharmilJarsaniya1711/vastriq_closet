import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AdminGuard } from '../admin/admin.guard';
import { GetCurrentUserId } from '../auth/decorators';
import { JoiValidationPipe } from '../joi-validation-pipe/joi-validation-pipe.interceptor';
import { UtilService } from '../shared/util/util.service';
import {
  CreateOutfitDto,
  UpdateOutfitDto,
  createOutfitSchema,
  rejectOutfitSchema,
  updateOutfitSchema,
} from './outfits.dto';
import { OutfitsService } from './outfits.service';

@ApiTags('Outfits')
@ApiBearerAuth()
@Controller('outfits')
export class OutfitsController {
  constructor(private readonly outfits: OutfitsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a listing (goes to moderation as PENDING)' })
  @UsePipes(new JoiValidationPipe(createOutfitSchema, 'body'))
  async create(@GetCurrentUserId() userId: string, @Body() dto: CreateOutfitDto) {
    return UtilService.buildResponse({ outfit: await this.outfits.create(userId, dto) });
  }

  @Get('mine')
  @ApiOperation({ summary: "List the current user's own listings" })
  async mine(@GetCurrentUserId() userId: string, @Query('status') status?: string) {
    return UtilService.buildResponse({ items: await this.outfits.listMine(userId, status) });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of the current user\'s listings (for editing)' })
  async one(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return UtilService.buildResponse({ outfit: await this.outfits.getOwned(id, userId) });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit a listing (re-enters moderation)' })
  @UsePipes(new JoiValidationPipe(updateOutfitSchema, 'body'))
  async update(
    @Param('id') id: string,
    @GetCurrentUserId() userId: string,
    @Body() dto: UpdateOutfitDto
  ) {
    return UtilService.buildResponse({ outfit: await this.outfits.update(id, userId, dto) });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive a listing' })
  async archive(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return UtilService.buildResponse({ outfit: await this.outfits.archive(id, userId) });
  }

  // ---- Admin moderation ----
  @Post(':id/approve')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin: approve a listing → ACTIVE' })
  async approve(@Param('id') id: string) {
    return UtilService.buildResponse({ outfit: await this.outfits.approve(id) });
  }

  @Post(':id/reject')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Admin: reject a listing with a reason' })
  @UsePipes(new JoiValidationPipe(rejectOutfitSchema, 'body'))
  async reject(@Param('id') id: string, @Body() body: { reason: string }) {
    return UtilService.buildResponse({ outfit: await this.outfits.reject(id, body.reason) });
  }
}
