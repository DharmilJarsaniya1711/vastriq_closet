import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload, JWTTokenType } from '../types';
import { AppConfigService } from '../../app-config/app-config.service';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly appConfigService: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: appConfigService.jwt.atSecret,
    });
  }

  validate(payload: JwtPayload) {
    if (payload?.tokenType !== JWTTokenType.ACCESS) {
      throw new ForbiddenException('Invalid token');
    }

    return payload;
  }
}
