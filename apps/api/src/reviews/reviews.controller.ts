import { Body, Controller, Get, Param, Post, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AdminGuard } from '../admin/admin.guard';
import { GetCurrentUserId, Public } from '../auth/decorators';
import { JoiValidationPipe } from '../joi-validation-pipe/joi-validation-pipe.interceptor';
import { UtilService } from '../shared/util/util.service';
import { CreateReviewDto, createReviewSchema } from './reviews.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Submit a review (held for moderation)' })
  @UsePipes(new JoiValidationPipe(createReviewSchema, 'body'))
  async create(@GetCurrentUserId() userId: string, @Body() dto: CreateReviewDto) {
    return UtilService.buildResponse({ review: await this.reviews.create(userId, dto) });
  }

  @Public()
  @Get('outfit/:slug')
  @ApiOperation({ summary: 'List approved reviews for an outfit' })
  async listForOutfit(@Param('slug') slug: string) {
    return UtilService.buildResponse({ items: await this.reviews.listForOutfit(slug) });
  }

  // ---- Admin moderation ----
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Get('pending')
  @ApiOperation({ summary: 'Admin: list reviews awaiting moderation' })
  async pending() {
    return UtilService.buildResponse({ items: await this.reviews.listPending() });
  }

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post(':id/approve')
  @ApiOperation({ summary: 'Admin: approve a review' })
  async approve(@Param('id') id: string) {
    return UtilService.buildResponse({ review: await this.reviews.approve(id) });
  }

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post(':id/hide')
  @ApiOperation({ summary: 'Admin: hide a review' })
  async hide(@Param('id') id: string) {
    return UtilService.buildResponse({ review: await this.reviews.hide(id) });
  }
}
