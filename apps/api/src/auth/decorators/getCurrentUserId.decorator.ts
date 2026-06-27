import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../types';

export const GetCurrentUserId = createParamDecorator(
  async (_: undefined, context: ExecutionContext): Promise<string> => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user) return null;

    return user.sub;
  },
);
