import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneUserDto } from './dto/findone-user.dto';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../config/configuration';
import { handleError } from '../utils/error';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService<ConfigType>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);
      return user;
    } catch (error: any) {
      return handleError(error);
    }
  }

  async findOne(findOneUserDto: FindOneUserDto): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: findOneUserDto,
        cache: this.getRedisCacheTtl(),
      });
    } catch (error: any) {
      return handleError(error);
    }
  }

  private getRedisCacheTtl(): number {
    const ttl = this.configService.get('REDIS_CACHE_TTL', { infer: true });
    return ttl ?? 60_000;
  }
}
