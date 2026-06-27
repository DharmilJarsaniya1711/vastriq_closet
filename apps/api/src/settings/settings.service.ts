import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './settings.dto';

const KEY = 'global';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Returns the singleton settings doc, creating it on first access.
  async get() {
    const existing = await this.prisma.setting.findUnique({ where: { key: KEY } });
    if (existing) return existing;
    return this.prisma.setting.create({ data: { key: KEY } });
  }

  async update(dto: UpdateSettingsDto) {
    await this.get(); // ensure it exists
    return this.prisma.setting.update({ where: { key: KEY }, data: dto });
  }
}
