import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OutfitStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CreateOutfitDto, UpdateOutfitDto } from './outfits.dto';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

@Injectable()
export class OutfitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService
  ) {}

  private async uniqueSlug(title: string): Promise<string> {
    const base = slugify(title) || 'outfit';
    let slug = base;
    // Append a short random suffix until the slug is free.
    while (await this.prisma.outfit.findUnique({ where: { slug } })) {
      slug = `${base}-${Math.random().toString(36).slice(2, 7)}`;
    }
    return slug;
  }

  private async categoryIdFromSlug(slug: string): Promise<string> {
    const category = await this.prisma.category.findUnique({ where: { slug } });
    if (!category) throw new BadRequestException(`Unknown category: ${slug}`);
    return category.id;
  }

  async create(ownerId: string, dto: CreateOutfitDto) {
    const categoryId = await this.categoryIdFromSlug(dto.categorySlug);
    const slug = await this.uniqueSlug(dto.title);

    // If admins enabled auto-approval, new listings go live immediately.
    const { autoApproveListings } = await this.settings.get();
    const status = autoApproveListings ? OutfitStatus.ACTIVE : OutfitStatus.PENDING;

    return this.prisma.outfit.create({
      data: {
        ownerId,
        title: dto.title,
        slug,
        description: dto.description ?? null,
        categoryId,
        occasionSlugs: dto.occasionSlugs ?? [],
        color: dto.color ?? null,
        imageUrls: dto.imageUrls,
        videoUrl: dto.videoUrl ?? null,
        mrp: dto.mrp ?? null,
        rentPerDay: dto.rentPerDay,
        securityDeposit: dto.securityDeposit ?? 0,
        citySlugs: dto.citySlugs,
        availabilityNote: dto.availabilityNote ?? null,
        status,
      },
    });
  }

  private async ownedOutfitOrThrow(id: string, ownerId: string) {
    const outfit = await this.prisma.outfit.findUnique({ where: { id } });
    if (!outfit) throw new NotFoundException('Outfit not found');
    if (outfit.ownerId !== ownerId) throw new ForbiddenException('Not your listing');
    return outfit;
  }

  async getOwned(id: string, ownerId: string) {
    const outfit = await this.prisma.outfit.findUnique({
      where: { id },
      include: { category: { select: { slug: true, name: true } } },
    });
    if (!outfit) throw new NotFoundException('Outfit not found');
    if (outfit.ownerId !== ownerId) throw new ForbiddenException('Not your listing');
    return outfit;
  }

  async listMine(ownerId: string, status?: string) {
    const where: Prisma.OutfitWhereInput = { ownerId };
    if (status) where.status = status as OutfitStatus;
    return this.prisma.outfit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { slug: true, name: true } } },
    });
  }

  async update(id: string, ownerId: string, dto: UpdateOutfitDto) {
    await this.ownedOutfitOrThrow(id, ownerId);

    const data: Prisma.OutfitUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.occasionSlugs !== undefined) data.occasionSlugs = dto.occasionSlugs;
    if (dto.color !== undefined) data.color = dto.color;
    if (dto.imageUrls !== undefined) data.imageUrls = dto.imageUrls;
    if (dto.videoUrl !== undefined) data.videoUrl = dto.videoUrl;
    if (dto.mrp !== undefined) data.mrp = dto.mrp;
    if (dto.rentPerDay !== undefined) data.rentPerDay = dto.rentPerDay;
    if (dto.securityDeposit !== undefined) data.securityDeposit = dto.securityDeposit;
    if (dto.citySlugs !== undefined) data.citySlugs = dto.citySlugs;
    if (dto.availabilityNote !== undefined) data.availabilityNote = dto.availabilityNote;
    if (dto.categorySlug !== undefined) {
      const categoryId = await this.categoryIdFromSlug(dto.categorySlug);
      data.category = { connect: { id: categoryId } };
    }

    // Any content edit re-enters the moderation queue.
    data.status = OutfitStatus.PENDING;
    data.rejectionReason = null;

    return this.prisma.outfit.update({ where: { id }, data });
  }

  async archive(id: string, ownerId: string) {
    await this.ownedOutfitOrThrow(id, ownerId);
    return this.prisma.outfit.update({
      where: { id },
      data: { status: OutfitStatus.ARCHIVED },
    });
  }

  // ---- Admin moderation ----
  async approve(id: string) {
    const outfit = await this.prisma.outfit.findUnique({ where: { id } });
    if (!outfit) throw new NotFoundException('Outfit not found');
    return this.prisma.outfit.update({
      where: { id },
      data: { status: OutfitStatus.ACTIVE, rejectionReason: null },
    });
  }

  async reject(id: string, reason: string) {
    const outfit = await this.prisma.outfit.findUnique({ where: { id } });
    if (!outfit) throw new NotFoundException('Outfit not found');
    return this.prisma.outfit.update({
      where: { id },
      data: { status: OutfitStatus.REJECTED, rejectionReason: reason },
    });
  }
}
