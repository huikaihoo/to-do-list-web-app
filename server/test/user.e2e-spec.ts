import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DateTime } from 'luxon';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { setupTestApp, createUserHelper } from './utils/helper';

const createUserDto = { username: 'testuser', password: 'password123' };

describe('UserController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await setupTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /v1/user', () => {
    it('should create a new user', async () => {
      expect.assertions(6);

      const response = await request(app.getHttpServer())
        .post('/v1/user')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        id: expect.any(String),
        username: createUserDto.username,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      expect(response.body).not.toHaveProperty('password');

      const createdAtDate = DateTime.fromISO(response.body.createdAt, { setZone: true });
      expect(createdAtDate.toString()).toBe(response.body.createdAt);

      const updatedAtDate = DateTime.fromISO(response.body.updatedAt, { setZone: true });
      expect(updatedAtDate.toString()).toBe(response.body.updatedAt);

      // Verify if the record was created in the database
      const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
      const user = await userRepository.findOneBy({ id: response.body.id });
      expect(user).toBeDefined();
      expect(user).toEqual({
        id: response.body.id,
        username: createUserDto.username,
        password: expect.any(String),
        createdAt: new Date(response.body.createdAt),
        updatedAt: new Date(response.body.updatedAt),
      });
    });

    it('should return a 400 bad request if validation fails', async () => {
      expect.assertions(2);

      const createUserDto = { username: undefined, password: undefined };

      const response = await request(app.getHttpServer())
        .post('/v1/user')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body?.error).toBe('Bad Request');

      // Verify if there is no record in the database
      const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
      const count = await userRepository.count();
      expect(count).toBe(0);
    });
  });

  describe('GET /v1/user', () => {
    it('should return the authenticated user', async () => {
      expect.assertions(4);

      const { token } = await createUserHelper(app, createUserDto);

      const response = await request(app.getHttpServer())
        .get('/v1/user')
        .set('Authorization', `Bearer ${token}`) // Set the Authorization header with the JWT token
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        id: expect.any(String),
        username: createUserDto.username,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      expect(response.body).not.toHaveProperty('password');

      const createdAtDate = DateTime.fromISO(response.body.createdAt, { setZone: true });
      expect(createdAtDate.toString()).toBe(response.body.createdAt);

      const updatedAtDate = DateTime.fromISO(response.body.updatedAt, { setZone: true });
      expect(updatedAtDate.toString()).toBe(response.body.updatedAt);
    });

    it('should return a 401 unauthorized if JWT token is not provided', async () => {
      expect.assertions(1);

      const response = await request(app.getHttpServer()).get('/v1/user').expect(HttpStatus.UNAUTHORIZED);

      expect(response.body?.message).toBe('Unauthorized');
    });
  });
});
