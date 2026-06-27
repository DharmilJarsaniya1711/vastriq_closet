import { Body, Controller, Delete, Get, Param, Post, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { GetCurrentUserId } from '../auth/decorators';
import { JoiValidationPipe } from '../joi-validation-pipe/joi-validation-pipe.interceptor';
import { UtilService } from '../shared/util/util.service';
import { AddWishlistDto, addWishlistSchema } from './wishlist.dto';
import { WishlistService } from './wishlist.service';

@ApiTags('Wishlist')
@ApiBearerAuth()
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlist: WishlistService) {}

  @Get()
  @ApiOperation({ summary: "List the current user's wishlist" })
  async list(@GetCurrentUserId() userId: string) {
    return UtilService.buildResponse({ items: await this.wishlist.list(userId) });
  }

  @Post()
  @ApiOperation({ summary: 'Add an outfit to the wishlist' })
  @UsePipes(new JoiValidationPipe(addWishlistSchema, 'body'))
  async add(@GetCurrentUserId() userId: string, @Body() dto: AddWishlistDto) {
    return UtilService.buildResponse({ item: await this.wishlist.add(userId, dto.outfitId) });
  }

  @Delete(':outfitId')
  @ApiOperation({ summary: 'Remove an outfit from the wishlist' })
  async remove(@GetCurrentUserId() userId: string, @Param('outfitId') outfitId: string) {
    return UtilService.buildResponse(await this.wishlist.remove(userId, outfitId));
  }
}
