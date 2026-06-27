import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { Public } from '../auth/decorators';
import { UtilService } from '../shared/util/util.service';
import { CatalogService, OutfitFilter } from './catalog.service';

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'List active categories' })
  async getCategories() {
    return UtilService.buildResponse({ items: await this.catalog.categories() });
  }

  @Public()
  @Get('occasions')
  @ApiOperation({ summary: 'List active occasions' })
  async getOccasions() {
    return UtilService.buildResponse({ items: await this.catalog.occasions() });
  }

  @Public()
  @Get('cities')
  @ApiOperation({ summary: 'List serviceable cities' })
  async getCities() {
    return UtilService.buildResponse({ items: await this.catalog.cities() });
  }

  @Public()
  @Get('colors')
  @ApiOperation({ summary: 'List active colors' })
  async getColors() {
    return UtilService.buildResponse({ items: await this.catalog.colors() });
  }

  @Public()
  @Get('outfits')
  @ApiOperation({ summary: 'List active outfits (filterable)' })
  async getOutfits(@Query() query: OutfitFilter) {
    return UtilService.buildResponse(await this.catalog.outfits(query));
  }

  @Public()
  @Get('outfits/:slug')
  @ApiOperation({ summary: 'Get outfit by slug' })
  async getOutfit(@Param('slug') slug: string) {
    const outfit = await this.catalog.outfitBySlug(slug);
    if (!outfit) throw new NotFoundException('Outfit not found');
    return UtilService.buildResponse({ outfit });
  }
}
