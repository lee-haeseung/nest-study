import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async postUser(
    @Body('email') email: string,
    @Body('nickname') nickname: string,
    @Body('password') password: string,
  ) {
    console.log('회원가입 요청', email, nickname, password);
    const newUser = await this.usersService.createUser(
      nickname,
      email,
      password,
    );
    return {
      message: '회원가입 성공',
      user: newUser,
    };
  }

  @Get()
  async getUsers() {
    const users = await this.usersService.findAll();
    return {
      message: '회원 목록 조회 성공',
      users,
    };
  }
}
