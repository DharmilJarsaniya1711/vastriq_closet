import { UserSignupMethod, UserType } from '@prisma/client';
import { TUniqueId } from '../../shared/types/type';

export enum JWTTokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export type JwtPayload = {
  email: string;
  type: UserType;
  signupMethod: UserSignupMethod;
  sub: TUniqueId;
  refreshToken?: string;
  tokenType: JWTTokenType;
};
