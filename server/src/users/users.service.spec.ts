import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { ConfigTestingModule, LoggerTestingModule, JwtTestingModule } from '../../test/utils/modules';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateUserDto } from './dto/create-user.dto';
import { mockUser } from '../../test/utils/entities';
import { BadRequestException } from '@nestjs/common';
import { FindOneUserDto } from './dto/findone-user.dto';
import { ConfigType } from '../../src/config/configuration';
import { ConfigService } from '@nestjs/config';

describe('UsersService', () => {
  let service: UsersService;
  let repo: DeepMocked<Repository<User>>;
  let cache: DeepMocked<Cache>;
  let configService: ConfigService<ConfigType>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigTestingModule(), LoggerTestingModule(), JwtTestingModule()],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>(),
        },
        {
          provide: CACHE_MANAGER,
          useValue: createMock<Cache>(),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<DeepMocked<Repository<User>>>(getRepositoryToken(User));
    cache = module.get<DeepMocked<Cache>>(CACHE_MANAGER);
    configService = module.get<ConfigService<ConfigType>>(ConfigService);
  });

  it('should be defined', () => {
    expect.assertions(4);

    expect(service).toBeDefined();
    expect(repo).toBeDefined();
    expect(cache).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      expect.assertions(3);

      const newUser = mockUser();
      const createUserDto: CreateUserDto = {
        username: newUser.username,
        password: newUser.password,
      };

      // Mock the userRepository.create and userRepository.save methods to return the new user
      repo.create.mockReturnValue(newUser);
      repo.save.mockResolvedValue(newUser);

      // Call the create method
      const result = await service.create(createUserDto);

      // Check the result
      expect(repo.create).toHaveBeenCalledWith(createUserDto);
      expect(repo.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual(newUser);
    });

    it('should throw an error when creating a new user from createUserDto fails', async () => {
      expect.assertions(1);

      const newUser = mockUser();
      const createUserDto: CreateUserDto = {
        username: newUser.username,
        password: newUser.password,
      };

      // Mock the userRepository.create method to throw an error
      repo.create.mockImplementation(() => {
        throw new Error();
      });

      // Call the create method and expect it to throw an error
      expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw an error when saving the new user fails', async () => {
      expect.assertions(2);

      const newUser = mockUser();
      const createUserDto: CreateUserDto = {
        username: newUser.username,
        password: newUser.password,
      };

      // Mock the userRepository.create method to return the new user
      repo.create.mockReturnValue(newUser);

      // Mock the userRepository.save method to throw an error
      repo.save.mockRejectedValue(new Error());

      // Call the create method and expect it to throw an error
      expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
      expect(repo.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findOne', () => {
    it('should find and return a user by findOneUserDto', async () => {
      expect.assertions(2);

      const ttl = 10_000;
      const user = mockUser();
      const findOneUserDto: FindOneUserDto = {
        username: user.username,
      };

      // Mock the userRepository.findOne method to return the user
      repo.findOne.mockResolvedValue(user);
      jest.spyOn(configService, 'get').mockReturnValue(ttl);

      // Call the findOne method
      const result = await service.findOne(findOneUserDto);

      // Check the result
      expect(repo.findOne).toHaveBeenCalledWith({
        where: findOneUserDto,
        cache: ttl,
      });
      expect(result).toEqual(user);
    });

    it('should return null if the user is not found', async () => {
      expect.assertions(2);

      const findOneUserDto: FindOneUserDto = {
        username: 'nonexistent_user',
      };

      // Mock the userRepository.findOne method to return null (user not found)
      repo.findOne.mockResolvedValue(null);
      jest.spyOn(configService, 'get').mockReturnValue(null);

      // Call the findOne method
      const result = await service.findOne(findOneUserDto);

      // Check the result
      expect(repo.findOne).toHaveBeenCalledWith({
        where: findOneUserDto,
        cache: 60_000,
      });
      expect(result).toBeNull();
    });

    it('should throw an error when the userRepository.findOne method fails', async () => {
      expect.assertions(1);

      const findOneUserDto: FindOneUserDto = {
        username: 'test_user',
      };

      // Mock the userRepository.findOne method to throw an error
      repo.findOne.mockRejectedValue(new Error());

      // Call the findOne method and expect it to throw an error
      expect(service.findOne(findOneUserDto)).rejects.toThrow(BadRequestException);
    });
  });
});
