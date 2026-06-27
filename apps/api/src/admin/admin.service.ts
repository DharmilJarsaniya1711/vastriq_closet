import { Injectable } from '@nestjs/common';
import { OutfitStatus, UserType } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

export interface UsersFilter {
  banned?: string;
  q?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // Platform-health KPIs — P2P model, no transactions / GMV.
  async overview() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [users, activeOutfits, pendingOutfits, totalEnquiries, openReports, newUsers30d] =
      await Promise.all([
        this.prisma.user.count({ where: { type: UserType.USER, deletedAt: { isSet: false } } }),
        this.prisma.outfit.count({ where: { status: OutfitStatus.ACTIVE } }),
        this.prisma.outfit.count({ where: { status: OutfitStatus.PENDING } }),
        this.prisma.enquiry.count(),
        this.prisma.report.count({ where: { status: 'OPEN' } }),
        this.prisma.user.count({
          where: { type: UserType.USER, createdAt: { gte: thirtyDaysAgo } },
        }),
      ]);

    // Signups series — last 30 days, bucketed daily
    const recentUsers = await this.prisma.user.findMany({
      where: { type: UserType.USER, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });
    const buckets: Record<string, { date: string; signups: number }> = {};
    for (let i = 0; i < 30; i += 1) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      buckets[key] = { date: key, signups: 0 };
    }
    for (const u of recentUsers) {
      const key = u.createdAt?.toISOString().slice(0, 10);
      if (key && buckets[key]) buckets[key].signups += 1;
    }

    // Top categories by active-outfit count
    const allActive = await this.prisma.outfit.findMany({
      where: { status: OutfitStatus.ACTIVE },
      select: { categoryId: true },
    });
    const categoryCount: Record<string, number> = {};
    for (const o of allActive) categoryCount[o.categoryId] = (categoryCount[o.categoryId] || 0) + 1;
    const topCategoryIds = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const categoryRecords = await this.prisma.category.findMany({
      where: { id: { in: topCategoryIds.map(([id]) => id) } },
    });
    const topCategories = topCategoryIds.map(([id, count]) => ({
      name: categoryRecords.find((c) => c.id === id)?.name ?? 'Unknown',
      count,
    }));

    return {
      kpis: {
        users,
        activeOutfits,
        pendingOutfits,
        totalEnquiries,
        openReports,
        newUsers30d,
      },
      signupsSeries: Object.values(buckets),
      topCategories,
    };
  }

  async listUsers(filter: UsersFilter) {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 20));
    const where: Record<string, unknown> = { deletedAt: { isSet: false } };

    if (filter.banned === 'true') where.banned = true;
    if (filter.q) {
      where.OR = [
        { firstName: { contains: filter.q, mode: 'insensitive' } },
        { lastName: { contains: filter.q, mode: 'insensitive' } },
        { email: { contains: filter.q, mode: 'insensitive' } },
        { phone: { contains: filter.q } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          type: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          banned: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  }

  async listOutfits(status?: string, page = 1, limit = 20) {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    const [items, total] = await Promise.all([
      this.prisma.outfit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { name: true } },
          owner: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
              ownerProfile: { select: { brandName: true } },
            },
          },
        },
      }),
      this.prisma.outfit.count({ where }),
    ]);
    return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
  }
}
