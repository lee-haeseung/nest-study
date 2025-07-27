import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class BearerTokenGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const rawToken = request.headers['authorization'];

    if (!rawToken) {
      throw new UnauthorizedException('토큰이 없습니다.');
    }

    // 토큰 추출
    const token = await this.authService.extractTokenFromHeader(rawToken);

    // 검증
    const result = await this.authService.verifyToken(token);

    /**
     * 1) 사용자 정보
     * 2) token
     * 3) tokenType
     */
    request.user = await this.usersService.findOneByEmail(result.email);
    request.token = token;
    request.tokenType = result.tokenType;

    return true;
  }
}

@Injectable()
export class AccessTokenGuard extends BearerTokenGuard {
  async catActicate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tokenType = request.tokenType;

    if (tokenType !== 'access') {
      throw new UnauthorizedException('Access token이 아닙니다.');
    }

    return super.canActivate(context);
  }
}

@Injectable()
export class RefreshTokenGuard extends BearerTokenGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tokenType = request.tokenType;

    if (tokenType !== 'refresh') {
      throw new UnauthorizedException('Refresh token이 아닙니다.');
    }

    return super.canActivate(context);
  }
}
