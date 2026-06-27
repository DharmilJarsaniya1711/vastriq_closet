import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

@Injectable()
export class CatalogAdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Categories ----
  listCategories() {
    return this.prisma.category.findMany({ orderBy: { order: 'asc' } });
  }
  createCategory(data: { name: string; icon?: string | null; order?: number; parentId?: string }) {
    return this.prisma.category.create({
      data: {
        name: data.name,
        slug: slugify(data.name),
        icon: data.icon ?? null,
        order: data.order ?? 0,
        parentId: data.parentId ?? null,
      },
    });
  }
  updateCategory(
    id: string,
    data: { name?: string; icon?: string | null; order?: number; isActive?: boolean }
  ) {
    return this.prisma.category.update({ where: { id }, data });
  }

  // ---- Colors ----
  listColors() {
    return this.prisma.color.findMany({ orderBy: { order: 'asc' } });
  }
  createColor(data: { name: string; hex?: string | null; order?: number }) {
    return this.prisma.color.create({
      data: {
        name: data.name,
        slug: slugify(data.name),
        hex: data.hex ?? null,
        order: data.order ?? 0,
      },
    });
  }
  updateColor(
    id: string,
    data: { name?: string; hex?: string | null; order?: number; isActive?: boolean }
  ) {
    return this.prisma.color.update({ where: { id }, data });
  }

  // ---- Occasions ----
  listOccasions() {
    return this.prisma.occasion.findMany({ orderBy: { order: 'asc' } });
  }
  createOccasion(data: { name: string; order?: number }) {
    return this.prisma.occasion.create({
      data: { name: data.name, slug: slugify(data.name), order: data.order ?? 0 },
    });
  }
  updateOccasion(id: string, data: { name?: string; order?: number; isActive?: boolean }) {
    return this.prisma.occasion.update({ where: { id }, data });
  }

  // ---- Cities ----
  listCities() {
    return this.prisma.city.findMany({ orderBy: [{ state: 'asc' }, { name: 'asc' }] });
  }
  createCity(data: { name: string; state?: string | null }) {
    return this.prisma.city.create({
      data: { name: data.name, slug: slugify(data.name), state: data.state ?? null },
    });
  }
  updateCity(
    id: string,
    data: { name?: string; state?: string | null; isServiceable?: boolean }
  ) {
    return this.prisma.city.update({ where: { id }, data });
  }
}
