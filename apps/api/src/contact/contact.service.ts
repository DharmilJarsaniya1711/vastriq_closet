import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactQueryStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto, ResolveContactDto } from './contact.dto';

// "Contact us" enquiries submitted from the public site.
@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateContactDto, userId?: string) {
    return this.prisma.contactQuery.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone ?? null,
        subject: dto.subject ?? null,
        message: dto.message,
        userId: userId ?? null,
      },
    });
  }

  // Admin inbox, optionally filtered by status.
  list(status?: string) {
    const where: Prisma.ContactQueryWhereInput = {};
    if (status) where.status = status as ContactQueryStatus;
    return this.prisma.contactQuery.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async resolve(id: string, handlerId: string, dto: ResolveContactDto) {
    const query = await this.prisma.contactQuery.findUnique({ where: { id } });
    if (!query) throw new NotFoundException('Query not found');
    const resolved = dto.status === ContactQueryStatus.RESOLVED;
    return this.prisma.contactQuery.update({
      where: { id },
      data: {
        status: dto.status,
        handledById: handlerId,
        resolvedAt: resolved ? new Date() : null,
      },
    });
  }
}
