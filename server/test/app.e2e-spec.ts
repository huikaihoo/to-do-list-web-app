import request from 'supertest';
import { setupTestApp } from './utils/helper';
import { INestApplication } from '@nestjs/common';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await setupTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /', () => {
    it('should return OK', () => {
      return request(app.getHttpServer()).get('/').expect(200).expect('OK');
    });
  });
});
