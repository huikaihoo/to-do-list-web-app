import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';

// Common setup function
const setupTestApp = async (): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  const cache = moduleFixture.get<Cache>(CACHE_MANAGER);
  await cache.store.reset();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
    new ValidationPipe({
      transform: true,
      transformOptions: { groups: ['transform'] },
    })
  );

  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  return app;
};

// Create user in test case
const createUserHelper = async (app: INestApplication, createUserDto: CreateUserDto) => {
  const { body: createdUser } = await request(app.getHttpServer())
    .post('/v1/user')
    .send(createUserDto)
    .expect(HttpStatus.CREATED);

  // Generate a valid JWT token to authenticate the request
  const jwtService = app.get<JwtService>(JwtService);
  const token = jwtService.sign({ sub: createdUser.id });

  return { createdUser, token };
};

export { setupTestApp, createUserHelper };
