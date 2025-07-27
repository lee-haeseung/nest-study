import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserModel } from '../entities/users.entity';

export const User = createParamDecorator(
  (data: keyof UserModel | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();

    const user = req.user;

    if (!user) {
      throw new InternalServerErrorException('Request에 user가 없습니다.');
    }

    if (data) {
      return user[data];
    }

    return user;
  },
);
