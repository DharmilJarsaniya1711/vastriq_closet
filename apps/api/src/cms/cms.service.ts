import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto, UpdateBannerDto } from './cms.dto';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  // Public: active banners within their schedule window, ordered.
  async publicBanners() {
    const now = new Date();
    const banners = await this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    return banners.filter(
      (b) => (!b.startsAt || b.startsAt <= now) && (!b.endsAt || b.endsAt >= now)
    );
  }

  // Admin: all banners.
  listAll() {
    return this.prisma.banner.findMany({ orderBy: { order: 'asc' } });
  }

  create(dto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: {
        title: dto.title,
        imageUrl: dto.imageUrl,
        ctaUrl: dto.ctaUrl ?? null,
        position: dto.position ?? null,
        order: dto.order ?? 0,
        startsAt: dto.startsAt ?? null,
        endsAt: dto.endsAt ?? null,
      },
    });
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    return this.prisma.banner.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) throw new NotFoundException('Banner not found');
    await this.prisma.banner.delete({ where: { id } });
    return { removed: true };
  }
}
