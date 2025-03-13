import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { IUser } from '../../users/interfaces/user.interface';

export const User = createParamDecorator(
  (data: keyof IUser | undefined, ctx: ExecutionContext) => {
    const request: Express.Request = ctx.switchToHttp().getRequest();

    if (!request.user) {
      throw new UnauthorizedException();
    }

    return data ? request.user[data] : request.user;
  },
);
