import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  // Recompute an outfit's rating rollup from its APPROVED reviews.
  private async recomputeRating(outfitId: string) {
    const approved = await this.prisma.review.findMany({
      where: { outfitId, approvedAt: { not: null } },
      select: { rating: true },
    });
    const totalReviews = approved.length;
    const avgRating = totalReviews
      ? approved.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;
    await this.prisma.outfit.update({
      where: { id: outfitId },
      data: { avgRating, totalReviews },
    });
  }

  // NOTE: the plan gates review creation on "had a conversation about this outfit"
  // (Phase 3 / chat). Until chat lands, any logged-in user (except the owner) may
  // review; every review stays hidden until an admin approves it.
  async create(authorId: string, dto: CreateReviewDto) {
    const outfit = await this.prisma.outfit.findUnique({ where: { id: dto.outfitId } });
    if (!outfit) throw new NotFoundException('Outfit not found');
    if (outfit.ownerId === authorId) {
      throw new BadRequestException('You cannot review your own listing');
    }

    return this.prisma.review.create({
      data: {
        outfitId: dto.outfitId,
        authorId,
        rating: dto.rating,
        title: dto.title ?? null,
        body: dto.body ?? null,
        photoUrls: dto.photoUrls ?? [],
      },
    });
  }

  // Public: approved reviews for an outfit (by slug).
  async listForOutfit(slug: string) {
    const outfit = await this.prisma.outfit.findUnique({ where: { slug }, select: { id: true } });
    if (!outfit) throw new NotFoundException('Outfit not found');
    return this.prisma.review.findMany({
      where: { outfitId: outfit.id, approvedAt: { not: null } },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { firstName: true, lastName: true } } },
    });
  }

  // ---- Admin moderation ----
  async listPending() {
    return this.prisma.review.findMany({
      where: { approvedAt: null },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { firstName: true, lastName: true } },
        outfit: { select: { slug: true, title: true } },
      },
    });
  }

  async approve(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    const updated = await this.prisma.review.update({
      where: { id },
      data: { approvedAt: new Date() },
    });
    await this.recomputeRating(review.outfitId);
    return updated;
  }

  async hide(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    const updated = await this.prisma.review.update({
      where: { id },
      data: { approvedAt: null },
    });
    await this.recomputeRating(review.outfitId);
    return updated;
  }
}
