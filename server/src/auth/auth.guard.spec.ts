import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ConfigType } from '../config/configuration';
import { ConfigTestingModule, LoggerTestingModule } from '../../test/modules';
import { mockJwtSecret } from '../../test/entities';
import { createMock } from '@golevelup/ts-jest';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtService: JwtService;
  let configService: ConfigService<ConfigType>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigTestingModule(), LoggerTestingModule()],
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: createMock<JwtService>(),
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService<ConfigType>>(ConfigService);
  });

  it('should be defined', () => {
    expect.assertions(3);

    expect(authGuard).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if the token is valid', async () => {
      expect.assertions(3);

      const token = 'valid-token';
      const payload = { sub: 'user-id' };
      const request: FastifyRequest & { payload: any } = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as any;

      // Mock the jwtService.verifyAsync method to return the payload
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload);

      // Mock the configService.get method to return the JWT_SECRET
      jest.spyOn(configService, 'get').mockReturnValue(mockJwtSecret);

      // Call the canActivate method
      const result = await authGuard.canActivate({ switchToHttp: () => ({ getRequest: () => request }) } as any);

      // Check the result
      expect(jwtService.verifyAsync).toHaveBeenCalledWith(token, { secret: mockJwtSecret });
      expect(request?.payload).toEqual(payload);
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException if the token is missing', async () => {
      expect.assertions(1);

      const request: FastifyRequest = {} as any;

      // Call the canActivate method and expect it to throw an UnauthorizedException
      await expect(
        authGuard.canActivate({ switchToHttp: () => ({ getRequest: () => request }) } as any)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if the token payload does not contain sub', async () => {
      expect.assertions(1);

      const token = 'invalid-token';
      const request: FastifyRequest = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as any;

      // Mock the jwtService.verifyAsync method to return a payload without the 'sub' property
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue({});

      // Call the canActivate method and expect it to throw an UnauthorizedException
      await expect(
        authGuard.canActivate({ switchToHttp: () => ({ getRequest: () => request }) } as any)
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if the token is invalid', async () => {
      expect.assertions(1);

      const token = 'invalid-token';
      const request: FastifyRequest = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as any;

      // Mock the jwtService.verifyAsync method to throw an exception
      jest.spyOn(jwtService, 'verifyAsync').mockRejectedValue(new Error());

      // Call the canActivate method and expect it to throw an UnauthorizedException
      await expect(
        authGuard.canActivate({ switchToHttp: () => ({ getRequest: () => request }) } as any)
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
