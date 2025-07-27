import {
  Body,
  Controller,
  Post,
  Headers,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  PasswordMaxLengthPipe,
  PasswordMinLengthPipe,
} from 'src/auth/pipe/password.pipe';
import { BasicTokenGuard } from './guard/basic-token.guard';
import { RefreshTokenGuard } from './guard/bearer-toekn.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh/access')
  @UseGuards(RefreshTokenGuard)
  async refreshAccessToken(@Headers('authorization') rawToken: string) {
    // 토큰 추출
    const token = await this.authService.extractTokenFromHeader(rawToken);
    const newToken = this.authService.rotateToken(token);
    return { accessToken: newToken };
  }

  @Post('refresh/refresh')
  @UseGuards(RefreshTokenGuard)
  async refreshRefreshToken(@Headers('authorization') rawToken: string) {
    // 토큰 추출
    const token = await this.authService.extractTokenFromHeader(rawToken);
    const newToken = this.authService.rotateToken(token);
    return { refreshToken: newToken };
  }

  @Post('login')
  @UseGuards(BasicTokenGuard)
  async login(
    @Headers('authorization') rawToken: string,
    @Request() request: any,
  ) {
    console.log(request);

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
    @Body('password', PasswordMaxLengthPipe, PasswordMinLengthPipe)
    password: string,
  ) {
    return await this.authService.registerWithEmail(nickname, email, password);
  }
}
