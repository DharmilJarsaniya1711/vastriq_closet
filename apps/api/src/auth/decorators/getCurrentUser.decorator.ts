import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../types';

export const GetCurrentUser = createParamDecorator(
  async (
    data: keyof JwtPayload | undefined,
    context: ExecutionContext,
  ): Promise<Partial<JwtPayload>> => {
    const request = context.switchToHttp().getRequest();

    const user = request.user as JwtPayload;

    if (!user) return null;

    if (!data) return user;

    return request.user[data];
  },
);
