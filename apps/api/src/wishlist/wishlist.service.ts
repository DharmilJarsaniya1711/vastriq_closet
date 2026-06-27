import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: string, outfitId: string) {
    const outfit = await this.prisma.outfit.findUnique({ where: { id: outfitId } });
    if (!outfit) throw new NotFoundException('Outfit not found');
    // Idempotent: unique [userId, outfitId].
    return this.prisma.wishlistItem.upsert({
      where: { userId_outfitId: { userId, outfitId } },
      update: {},
      create: { userId, outfitId },
    });
  }

  async remove(userId: string, outfitId: string) {
    await this.prisma.wishlistItem.deleteMany({ where: { userId, outfitId } });
    return { removed: true };
  }

  list(userId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        outfit: {
          include: { category: { select: { slug: true, name: true } } },
        },
      },
    });
  }
}
