import { Body, Controller, Get, Param, Patch, Post, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AdminGuard } from '../admin/admin.guard';
import { JoiValidationPipe } from '../joi-validation-pipe/joi-validation-pipe.interceptor';
import { UtilService } from '../shared/util/util.service';
import {
  createCategorySchema,
  createCitySchema,
  createColorSchema,
  createOccasionSchema,
  updateCategorySchema,
  updateCitySchema,
  updateColorSchema,
  updateOccasionSchema,
} from './catalog.admin.dto';
import { CatalogAdminService } from './catalog.admin.service';

// Catalog master — admin only. Items are never hard-deleted; disable via isActive/isServiceable.
@ApiTags('Admin Catalog')
@ApiBearerAuth()
@Controller('admin/catalog')
@UseGuards(AdminGuard)
export class CatalogAdminController {
  constructor(private readonly svc: CatalogAdminService) {}

  // ---- Categories ----
  @Get('categories')
  @ApiOperation({ summary: 'List all categories (incl. disabled)' })
  async listCategories() {
    return UtilService.buildResponse({ items: await this.svc.listCategories() });
  }
  @Post('categories')
  @UsePipes(new JoiValidationPipe(createCategorySchema, 'body'))
  async createCategory(@Body() body: { name: string; icon?: string; order?: number; parentId?: string }) {
    return UtilService.buildResponse({ item: await this.svc.createCategory(body) });
  }
  @Patch('categories/:id')
  @UsePipes(new JoiValidationPipe(updateCategorySchema, 'body'))
  async updateCategory(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return UtilService.buildResponse({ item: await this.svc.updateCategory(id, body) });
  }

  // ---- Colors ----
  @Get('colors')
  @ApiOperation({ summary: 'List all colors (incl. disabled)' })
  async listColors() {
    return UtilService.buildResponse({ items: await this.svc.listColors() });
  }
  @Post('colors')
  @UsePipes(new JoiValidationPipe(createColorSchema, 'body'))
  async createColor(@Body() body: { name: string; hex?: string; order?: number }) {
    return UtilService.buildResponse({ item: await this.svc.createColor(body) });
  }
  @Patch('colors/:id')
  @UsePipes(new JoiValidationPipe(updateColorSchema, 'body'))
  async updateColor(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return UtilService.buildResponse({ item: await this.svc.updateColor(id, body) });
  }

  // ---- Occasions ----
  @Get('occasions')
  @ApiOperation({ summary: 'List all occasions (incl. disabled)' })
  async listOccasions() {
    return UtilService.buildResponse({ items: await this.svc.listOccasions() });
  }
  @Post('occasions')
  @UsePipes(new JoiValidationPipe(createOccasionSchema, 'body'))
  async createOccasion(@Body() body: { name: string; order?: number }) {
    return UtilService.buildResponse({ item: await this.svc.createOccasion(body) });
  }
  @Patch('occasions/:id')
  @UsePipes(new JoiValidationPipe(updateOccasionSchema, 'body'))
  async updateOccasion(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return UtilService.buildResponse({ item: await this.svc.updateOccasion(id, body) });
  }

  // ---- Cities ----
  @Get('cities')
  @ApiOperation({ summary: 'List all cities (incl. non-serviceable)' })
  async listCities() {
    return UtilService.buildResponse({ items: await this.svc.listCities() });
  }
  @Post('cities')
  @UsePipes(new JoiValidationPipe(createCitySchema, 'body'))
  async createCity(@Body() body: { name: string; state?: string }) {
    return UtilService.buildResponse({ item: await this.svc.createCity(body) });
  }
  @Patch('cities/:id')
  @UsePipes(new JoiValidationPipe(updateCitySchema, 'body'))
  async updateCity(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return UtilService.buildResponse({ item: await this.svc.updateCity(id, body) });
  }
}
