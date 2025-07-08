import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from 'src/users/entities/users.entity';
import { JWT_SECRET } from './const/auth.const';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  /**
   * TODO
   *
   * 1. registerWithEmail
   * - email, nickname, password를 바탕으로 사용자 생성
   *
   * 2. loginWithEmail
   * - email, password를 바탕으로 사용자 인증
   *
   * 3. loginUser
   * - JWT 토큰 발급
   * - 1, 2 번에서 활용
   *
   * 4. signToken
   * - 사용자 정보를 바탕으로 JWT 토큰 생성
   * - 3 번에서 활용
   *
   * 5. authenticateWithEmailAndPassword
   * - 이메일과 비밀번호를 바탕으로 사용자 인증
   * - 2 번에서 활용
   *   A. 사용자 정보 조회
   *   B. 비밀번호 비교
   *   C. 사용자 정보 반환
   */

  /**
   * Payload에 들어갈 정보
   *
   * 1) email
   * 2) id
   * 3) type: 'access' | 'refresh'
   */
  signToken(user: Pick<UserModel, 'email' | 'id'>, isRefreshToken: boolean) {
    const payload = {
      email: user.email,
      id: user.id,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: JWT_SECRET,
      expiresIn: isRefreshToken ? 3600 : 300,
    });
  }

  loginUser(user: Pick<UserModel, 'email' | 'id'>) {
    return {
      accessToken: this.signToken(user, false),
      refreshToken: this.signToken(user, true),
    };
  }

  async authenticateWithEmailAndPassword(user: {
    email: string;
    password: string;
  }) {
    // Validation: 존재 확인
    const userData = await this.usersService.findOneByEmail(user.email);
    if (!userData) {
      throw new UnauthorizedException('User not found');
    }
    // Validation: 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(
      user.password,
      userData.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Return user data
    return userData;
  }

  async loginWithEmail(user: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const userData = await this.authenticateWithEmailAndPassword(user);
    return this.loginUser(userData);
  }

  async registerWithEmail(
    nickname: string,
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Validation: 이메일 중복 확인
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
    // Validation: 닉네임 중복 확인
    const existingNickname =
      await this.usersService.findOneByNickname(nickname);
    if (existingNickname) {
      throw new BadRequestException('Nickname already exists');
    }

    // Create new user
    const newUser = await this.usersService.createUser(
      nickname,
      email,
      password,
    );

    // Generate tokens
    return this.loginUser(newUser);
  }
}
