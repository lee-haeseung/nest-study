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
   * 토큰 사용 방식
   *
   * 1) 사용자가 로그인, 회원가입을 진행하면 accessToken과 refreshToken을 발급받는다.
   * 2) 로그인할 때는 Basic 토큰과 함께 요청을 보낸다. (Basic 토큰은 'email:password' 형태로 Base64 인코딩된 값)
   * 3) 아무나 접근할 수 없는 정보를 접근할 때는 accessToken을 Header에 담아 요청을 보낸다.
   * 4) 토큰과 요청을 함께 받은 서버는 토큰 검증을 통해 현재 요청을 보낸 사용자가 누구인지 알 수 있다.
   * 5) 만료된 토큰은 사용 불가하다.
   * 6) 토큰이 만료되면 refreshToken을 사용하여 새로운 accessToken을 발급받을 수 있다.
   */

  /**
   * Header로부터 토큰을 받을 때
   * {authorization: 'Basic <Base64 인코딩된 email:password>'}
   * {authorization: 'Bearer <accessToken>'}
   */
  async extractTokenFromHeader(header: string, isBearer: boolean = true) {
    const splitToken = header.split(' ');
    if (splitToken.length !== 2) {
      throw new UnauthorizedException('Invalid token format');
    }

    const tokenType = splitToken[0];
    const token = splitToken[1];

    if (isBearer && tokenType !== 'Bearer') {
      throw new UnauthorizedException('Invalid token type');
    } else if (!isBearer && tokenType !== 'Basic') {
      throw new UnauthorizedException('Invalid token type');
    }
    return token;
  }

  /**
   * 디코드 후 반환
   */
  decodeBasicToken(base64String: string): { email: string; password: string } {
    const decoded = Buffer.from(base64String, 'base64').toString('utf-8');

    const split = decoded.split(':');
    if (split.length !== 2) {
      throw new UnauthorizedException('Invalid Basic token format');
    }

    const [email, password] = split;
    return { email, password };
  }

  verifyToken(token: string) {
    return this.jwtService.verify(token, {
      secret: JWT_SECRET,
    });
  }

  rotateToken(token: string, isRefreshToken: boolean = false) {
    const decoded = this.verifyToken(token);

    if (decoded.type !== 'refresh') {
      throw new UnauthorizedException('Refresh token required');
    }

    return this.signToken(
      { email: decoded.email, id: decoded.id },
      isRefreshToken,
    );
  }

  /**
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
