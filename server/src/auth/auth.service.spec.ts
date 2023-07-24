import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ConfigTestingModule, JwtTestingModule, LoggerTestingModule } from '../../test/modules';
import bcrypt from 'bcrypt';
import { mockHashedPassword, mockJwtSecret, mockUser } from '../../test/entities';
import { JwtService } from '@nestjs/jwt';
import _ from 'lodash';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigTestingModule(), LoggerTestingModule(), JwtTestingModule()],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: createMock<UsersService>(),
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect.assertions(3);

    expect(authService).toBeDefined();
    expect(usersService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('signIn', () => {
    it('should return token when the user is found and password is a match', async () => {
      expect.assertions(5);

      const user = mockUser();
      const { username, password } = user;
      user.password = mockHashedPassword;

      // Mock the usersService.findOne method to return the user
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      // Call the signIn method
      const result = await authService.signIn(username, password);
      console.log('result.token', result.token);

      // Check the result
      expect(usersService.findOne).toHaveBeenCalledWith({ username });
      expect(_.isString(result?.token)).toBe(true);

      // Check if result.token is a valid JWT
      const decoded = jwtService.verify(result.token, { secret: mockJwtSecret });

      expect(decoded).toHaveProperty('sub', user.id);
      expect(_.isNumber(decoded.iat)).toBe(true);
      expect(_.isNumber(decoded.exp)).toBe(true);
    });

    it('should return token when the user is found and password is a match (mocked bcrypt & jwtService)', async () => {
      expect.assertions(3);

      const user = mockUser();
      const token = 'mock-token';

      const { username, password } = user;
      user.password = 'encrypted-password';

      // Mock on methods
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(token);

      // Call the signIn method
      const result = await authService.signIn(username, password);

      // Check the result
      expect(usersService.findOne).toHaveBeenCalledWith({ username: user.username });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(result).toEqual({ token });
    });

    it('should return UnauthorizedException when the user is found and password is not match (mocked bcrypt & jwtService)', async () => {
      expect.assertions(2);

      const user = mockUser();
      const { username, password } = user;

      // Mock on methods
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      // Call the signIn method and expect it to throw an UnauthorizedException
      const result = await authService.signIn(username, password);

      expect(usersService.findOne).toHaveBeenCalledWith({ username });
      expect(result).toBeInstanceOf(UnauthorizedException);
    });

    it('should return UnauthorizedException when the user is not found', async () => {
      expect.assertions(2);

      const { username, password } = mockUser();

      // Mock the usersService.findOne method to return null (user not found)
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

      // Call the signIn method and expect it to throw an UnauthorizedException
      const result = await authService.signIn(username, password);

      expect(usersService.findOne).toHaveBeenCalledWith({ username });
      expect(result).toBeInstanceOf(UnauthorizedException);
    });

    it('should throw UnauthorizedException when bcrypt.compare throws an exception', async () => {
      expect.assertions(1);

      const { username, password } = mockUser();

      // Mock the bcrypt.compare method to throw an exception
      jest.spyOn(bcrypt, 'compare').mockRejectedValue(new Error() as never);

      // Call the signIn method and expect it to throw an BadRequestException
      await expect(authService.signIn(username, password)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when usersService.findOne throws an exception', async () => {
      expect.assertions(1);

      const { username, password } = mockUser();

      // Mock the usersService.findOne method to throw an exception
      jest.spyOn(usersService, 'findOne').mockRejectedValue(new Error());

      // Call the signIn method and expect it to throw an BadRequestException
      await expect(authService.signIn(username, password)).rejects.toThrow(BadRequestException);
    });
  });
});
