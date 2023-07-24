import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ConfigTestingModule, LoggerTestingModule } from '../../test/utils/modules';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { DeepMocked, createMock } from '@golevelup/ts-jest';

describe('AuthController', () => {
  let controller: AuthController;
  let service: DeepMocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigTestingModule(), LoggerTestingModule()],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: createMock<AuthService>(),
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<DeepMocked<AuthService>>(AuthService);
  });

  it('should be defined', () => {
    expect.assertions(2);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('signIn', () => {
    it('should sign in a user and return the result', async () => {
      expect.assertions(2);

      const signInDto = { username: 'testuser', password: 'testpassword' };
      const expectedResult = { token: 'mockAccessToken' };

      // Mock the authService.signIn method to return the expected result
      service.signIn.mockResolvedValue(expectedResult);

      // Call the controller method
      const result = await controller.signIn(signInDto);

      // Check the result
      expect(service.signIn).toHaveBeenCalledWith(signInDto.username, signInDto.password);
      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException if invalid credentials are provided', async () => {
      expect.assertions(1);

      const signInDto = { username: 'testuser', password: 'invalidpassword' };

      // Mock the authService.signIn method to throw an UnauthorizedException
      service.signIn.mockRejectedValue(new UnauthorizedException());

      // Call the controller method and expect it to throw an UnauthorizedException
      await expect(controller.signIn(signInDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
