import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ReportStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto, ResolveReportDto } from './reports.dto';

// Trust & Safety reports (listing / user / message).
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  create(reporterId: string, dto: CreateReportDto) {
    return this.prisma.report.create({
      data: {
        targetType: dto.targetType,
        targetId: dto.targetId,
        reporterId,
        reason: dto.reason,
        details: dto.details ?? null,
        evidenceUrls: dto.evidenceUrls ?? [],
      },
    });
  }

  // Admin queue, optionally filtered by status.
  list(status?: string) {
    const where: Prisma.ReportWhereInput = {};
    if (status) where.status = status as ReportStatus;
    return this.prisma.report.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async resolve(id: string, handlerId: string, dto: ResolveReportDto) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw new NotFoundException('Report not found');
    const terminal = dto.status === ReportStatus.ACTIONED || dto.status === ReportStatus.DISMISSED;
    return this.prisma.report.update({
      where: { id },
      data: {
        status: dto.status,
        resolution: dto.resolution ?? null,
        handledById: handlerId,
        resolvedAt: terminal ? new Date() : null,
      },
    });
  }
}
