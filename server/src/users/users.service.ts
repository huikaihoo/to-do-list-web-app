import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneUserDto } from './dto/findone-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);
      return user;
    } catch (error: any) {
      const message = error.detail ?? error.toString();
      throw new BadRequestException(message);
    }
  }

  async findOne(findOneUserDto: FindOneUserDto): Promise<User | null> {
    try {
      return await this.userRepository.findOneBy(findOneUserDto);
    } catch (error: any) {
      const message = error.detail ?? error.toString();
      throw new BadRequestException(message);
    }
  }
}
