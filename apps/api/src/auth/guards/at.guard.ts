import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../types';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../../app-config/app-config.service';

@Injectable()
export class AtGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly prismaService: PrismaService,
    private jwtService: JwtService,
    private readonly appConfigService: AppConfigService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    const isRefresh = this.reflector.getAllAndOverride('isRefresh', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic || isRefresh) return true;

    try {
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(context.switchToHttp().getRequest());

      if (!token) throw new Error();

      const user = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.appConfigService.jwt.atSecret,
      });

      const userInDb = await this.prismaService.user.findFirst({ where: { id: user.sub } });

      if (!userInDb || userInDb.banned || userInDb.deletedAt) throw new Error();
    } catch (error) {
      throw new UnauthorizedException();
    }

    return (await super.canActivate(context)) as boolean;
  }
}
