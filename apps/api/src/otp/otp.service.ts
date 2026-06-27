import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OtpChannel, OtpIntent } from '@prisma/client';
import * as argon from 'argon2';

import { PrismaService } from '../prisma/prisma.service';

const OTP_TTL_MINUTES = 5;
const MAX_REQUESTS_PER_HOUR = 5;
const MAX_VERIFY_ATTEMPTS = 5;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {
    if (this.devBypassEnabled) {
      this.logger.warn(
        `\x1b[31m[OTP] AUTH_DEV_BYPASS_ENABLED is TRUE — dev master OTP "${this.devMasterOtp}" will be accepted for allowlisted phones. DO NOT enable in production.\x1b[0m`
      );
    }
  }

  private get devBypassEnabled(): boolean {
    return this.config.get<string>('AUTH_DEV_BYPASS_ENABLED') === 'true';
  }

  private get devMasterOtp(): string {
    return this.config.get<string>('AUTH_DEV_MASTER_OTP') || '000000';
  }

  private get devPhoneAllowlist(): string[] {
    const raw = this.config.get<string>('AUTH_DEV_PHONE_ALLOWLIST') || '';
    return raw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
  }

  private isDevAllowedPhone(phone: string): boolean {
    const list = this.devPhoneAllowlist;
    if (list.length === 0) return false;
    return list.includes(phone);
  }

  async requestOtp(phone: string, intent: OtpIntent = OtpIntent.LOGIN): Promise<{ sent: true; channel: OtpChannel; devCode?: string }> {
    // Rate limit: max N requests/hour/phone
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recent = await this.prisma.otpRequest.count({
      where: { phone, createdAt: { gte: oneHourAgo } },
    });
    if (recent >= MAX_REQUESTS_PER_HOUR) {
      throw new BadRequestException('Too many OTP requests. Try again later.');
    }

    const channel: OtpChannel = this.devBypassEnabled ? OtpChannel.DEV : OtpChannel.WHATSAPP;
    const code = this.generateCode();
    const codeHash = await argon.hash(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await this.prisma.otpRequest.create({
      data: { phone, codeHash, channel, intent, expiresAt },
    });

    // No real SMS/WhatsApp provider yet. In dev/manual mode we surface the REAL
    // generated code so it can be shown on screen and verified for ANY number
    // (new or existing) — no external send required.
    this.logger.log(`[OTP] phone=${phone} intent=${intent} channel=${channel} code=${code} (dev)`);

    return {
      sent: true,
      channel,
      ...(this.devBypassEnabled ? { devCode: code } : {}),
    };
  }

  async verifyOtp(phone: string, code: string): Promise<{ ok: true }> {
    // Dev bypass path
    if (this.devBypassEnabled && this.isDevAllowedPhone(phone) && code === this.devMasterOtp) {
      this.logger.warn(`[OTP] dev bypass accepted for ${phone}`);
      return { ok: true };
    }

    const latest = await this.prisma.otpRequest.findFirst({
      // Mongo: an un-consumed row has consumedAt *unset* (not null), so use isSet.
      where: { phone, consumedAt: { isSet: false }, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!latest) {
      throw new BadRequestException('OTP expired or not requested.');
    }
    if (latest.attempts >= MAX_VERIFY_ATTEMPTS) {
      throw new BadRequestException('Too many invalid attempts. Request a new OTP.');
    }
    const ok = await argon.verify(latest.codeHash, code);
    await this.prisma.otpRequest.update({
      where: { id: latest.id },
      data: ok ? { consumedAt: new Date() } : { attempts: { increment: 1 } },
    });
    if (!ok) throw new BadRequestException('Invalid OTP.');
    return { ok: true };
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
