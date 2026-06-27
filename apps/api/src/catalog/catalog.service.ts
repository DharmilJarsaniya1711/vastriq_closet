import { Injectable } from '@nestjs/common';
import { OutfitStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

export interface OutfitFilter {
  category?: string;
  occasion?: string;
  city?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async categories() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async occasions() {
    return this.prisma.occasion.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async cities() {
    return this.prisma.city.findMany({
      where: { isServiceable: true },
      orderBy: { name: 'asc' },
    });
  }

  async colors() {
    return this.prisma.color.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async outfits(filter: OutfitFilter) {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(48, Math.max(1, Number(filter.limit) || 12));
    const where: Record<string, unknown> = { status: OutfitStatus.ACTIVE };

    if (filter.category) {
      const cat = await this.prisma.category.findUnique({ where: { slug: filter.category } });
      if (cat) where.categoryId = cat.id;
    }
    if (filter.occasion) where.occasionSlugs = { has: filter.occasion };
    if (filter.city) where.citySlugs = { has: filter.city };
    if (filter.color) where.color = filter.color;
    if (filter.minPrice || filter.maxPrice) {
      where.rentPerDay = {
        ...(filter.minPrice ? { gte: Number(filter.minPrice) } : {}),
        ...(filter.maxPrice ? { lte: Number(filter.maxPrice) } : {}),
      };
    }
    if (filter.q) where.title = { contains: filter.q, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      this.prisma.outfit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { slug: true, name: true } },
          owner: { select: { id: true, firstName: true, ownerProfile: { select: { brandName: true } } } },
        },
      }),
      this.prisma.outfit.count({ where }),
    ]);

    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async outfitBySlug(slug: string) {
    // Fire-and-forget view count bump (don't block the response on it).
    this.prisma.outfit
      .updateMany({ where: { slug }, data: { viewsCount: { increment: 1 } } })
      .catch(() => undefined);

    return this.prisma.outfit.findUnique({
      where: { slug },
      include: {
        category: { select: { slug: true, name: true } },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            ownerProfile: { select: { brandName: true, bio: true, rating: true } },
          },
        },
      },
    });
  }
}
