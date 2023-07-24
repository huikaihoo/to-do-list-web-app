import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigTestingModule, JwtTestingModule, LoggerTestingModule } from '../../test/utils/modules';
import { BadRequestException } from '@nestjs/common';
import { mockUser, mockUserId } from '../../test/utils/entities';
import { DeepMocked, createMock } from '@golevelup/ts-jest';

describe('UsersController', () => {
  let controller: UsersController;
  let service: DeepMocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigTestingModule(), LoggerTestingModule(), JwtTestingModule()],
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: createMock<UsersService>(),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<DeepMocked<UsersService>>(UsersService);
  });

  it('should be defined', () => {
    expect.assertions(2);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user and return the user without password', async () => {
      expect.assertions(2);

      const createUserDto = { username: 'testuser', password: 'testpassword' };

      // Mock the usersService.create method to return the created user
      const user = mockUser(mockUserId);
      service.create.mockResolvedValue(user);

      // Call the controller method
      const result = await controller.create(createUserDto);

      // Check the result
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      const expectedUser = mockUser(mockUserId, true);
      expect(result).toEqual(expectedUser);
    });

    it('should throw BadRequestException if service.create throws error', async () => {
      expect.assertions(1);

      const createUserDto = { username: 'testuser', password: 'testpassword' };

      // Mock the usersService.create method to throw a BadRequestException
      service.create.mockRejectedValue(new BadRequestException());

      // Call the controller method and expect it to throw a BadRequestException
      await expect(controller.create(createUserDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should find and return a user', async () => {
      expect.assertions(2);

      const request = { payload: { sub: mockUserId } };
      const findOneUserDto = { id: mockUserId };

      // Mock the usersService.findOne method to return a user
      const user = mockUser(mockUserId);
      service.findOne.mockResolvedValue(user);

      // Call the controller method
      const result = await controller.findOne(request);

      // Check the result
      const expectedUser = mockUser(mockUserId, true);
      expect(service.findOne).toHaveBeenCalledWith(findOneUserDto);
      expect(result).toEqual(expectedUser);
    });

    it('should throw BadRequestException if validation fails', async () => {
      expect.assertions(1);

      const userId = 'invalid_user_id';
      const request = { payload: { sub: userId } };

      // Call the controller method and expect it to throw a BadRequestException
      await expect(controller.findOne(request)).rejects.toThrow(BadRequestException);
    });

    it('should return null if the user is not found', async () => {
      expect.assertions(2);

      const request = { payload: { sub: mockUserId } };
      const findOneUserDto = { id: mockUserId };

      // Mock the usersService.findOne method to return null (user not found)
      service.findOne.mockResolvedValue(null);

      // Call the controller method
      const result = await controller.findOne(request);

      // Check the result
      expect(service.findOne).toHaveBeenCalledWith(findOneUserDto);
      expect(result).toBeUndefined();
    });
  });
});
