import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { setupTestApp } from './utils/helper';
import { JwtService } from '@nestjs/jwt';

const createUserDto = { username: 'testuser', password: 'password123' };

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await setupTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /v1/auth/login', () => {
    it('should return a JWT token upon successful login', async () => {
      expect.assertions(2);

      const createResponse = await request(app.getHttpServer())
        .post('/v1/user')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const signInDto = { username: 'testuser', password: 'password123' };
      const response = await request(app.getHttpServer()).post('/v1/auth/login').send(signInDto).expect(HttpStatus.OK);

      expect(response.body.token).toBeDefined();

      const jwtService = app.get<JwtService>(JwtService);
      const decodedToken = await jwtService.verifyAsync(response.body.token);
      expect(decodedToken.sub).toBe(createResponse.body.id);
    });

    it('should return a 401 Unauthorized if invalid credentials are provided', async () => {
      expect.assertions(1);

      await request(app.getHttpServer()).post('/v1/user').send(createUserDto).expect(HttpStatus.CREATED);

      const signInDto = { username: 'testuser', password: 'wrongpassword' };
      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send(signInDto)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.token).not.toBeDefined();
    });

    it('should return a 401 Unauthorized if the user does not exist', async () => {
      expect.assertions(1);

      const signInDto = { username: 'nonexistinguser', password: 'password123' };
      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send(signInDto)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.token).not.toBeDefined();
    });
  });
});
