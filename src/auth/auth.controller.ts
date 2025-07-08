import { Body, Controller, Post, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh/access')
  async refreshAccessToken(@Headers('authorization') rawToken: string) {
    // 토큰 추출
    const token = await this.authService.extractTokenFromHeader(rawToken);
    const newToken = this.authService.rotateToken(token);
    return { accessToken: newToken };
  }

  @Post('refresh/refresh')
  async refreshRefreshToken(@Headers('authorization') rawToken: string) {
    // 토큰 추출
    const token = await this.authService.extractTokenFromHeader(rawToken);
    const newToken = this.authService.rotateToken(token);
    return { refreshToken: newToken };
  }

  @Post('login')
  async login(@Headers('authorization') rawToken: string) {
    // 토큰 추출
    const token = await this.authService.extractTokenFromHeader(
      rawToken,
      false,
    );
    const { email, password } = this.authService.decodeBasicToken(token);

    return await this.authService.loginWithEmail({ email, password });
  }

  @Post('sign-up')
  async signUp(
    @Body('nickname') nickname: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.authService.registerWithEmail(nickname, email, password);
  }
}
