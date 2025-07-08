import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entities/users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { HASH_ROUNDS } from 'src/auth/const/auth.const';
import { UserRole } from './enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserModel)
    private readonly usersRepository: Repository<UserModel>,
  ) {}

  async createUser(nickname: string, email: string, password: string) {
    const encodedPassword = await bcrypt.hash(password, HASH_ROUNDS);

    const newUser = this.usersRepository.create({
      nickname,
      email,
      password: encodedPassword,
      role: UserRole.USER,
    });
    return await this.usersRepository.save(newUser);
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async findOneByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }

  async findOneByNickname(nickname: string) {
    return await this.usersRepository.findOne({
      where: { nickname },
    });
  }
}
