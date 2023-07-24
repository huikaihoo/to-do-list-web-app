import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DateTime } from 'luxon';
import { Repository } from 'typeorm';
import { Task } from '../src/tasks/entities/task.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TasksService } from '../src/tasks/tasks.service';
import { createUserHelper, setupTestApp } from './utils/helper';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

const createUserDto = { username: 'testuser', password: 'password123' };

describe('TasksController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await setupTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /v1/task', () => {
    it('should create a new task for the authenticated user', async () => {
      expect.assertions(5);

      const { createdUser, token } = await createUserHelper(app, createUserDto);

      const createTaskDto = { content: 'Test task content' };
      const { body: createdTask } = await request(app.getHttpServer())
        .post('/v1/task')
        .set('Authorization', `Bearer ${token}`)
        .send(createTaskDto)
        .expect(HttpStatus.CREATED);

      expect(createdTask).toEqual({
        id: expect.any(String),
        content: createTaskDto.content,
        isCompleted: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        deletedAt: null,
        userId: createdUser.id,
        user: {
          id: createdUser.id,
        },
      });

      const createdAtDate = DateTime.fromISO(createdTask.createdAt, { setZone: true });
      expect(createdAtDate.toString()).toBe(createdTask.createdAt);

      const updatedAtDate = DateTime.fromISO(createdTask.updatedAt, { setZone: true });
      expect(updatedAtDate.toString()).toBe(createdTask.updatedAt);

      // Verify if the task was created in the database
      const taskRepository = app.get<Repository<Task>>(getRepositoryToken(Task));
      const task = await taskRepository.findOneBy({ id: createdTask.id });
      expect(task).toBeDefined();
      expect(task).toEqual({
        id: expect.any(String),
        content: createTaskDto.content,
        isCompleted: false,
        createdAt: new Date(createdTask.createdAt),
        updatedAt: new Date(createdTask.updatedAt),
        deletedAt: null,
        userId: createdUser.id,
      });
    });

    it('should return a 400 bad request if validation fails', async () => {
      expect.assertions(2);

      const { token } = await createUserHelper(app, createUserDto);

      const createTaskDto = { content: undefined };
      const response = await request(app.getHttpServer())
        .post('/v1/task')
        .set('Authorization', `Bearer ${token}`)
        .send(createTaskDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body?.error).toBe('Bad Request');

      // Verify if there is no task created in the database
      const taskRepository = app.get<Repository<Task>>(getRepositoryToken(Task));
      const count = await taskRepository.count();
      expect(count).toBe(0);
    });
  });

  describe('GET /v1/task', () => {
    it('should return the tasks for the authenticated user', async () => {
      expect.assertions(7);

      const { createdUser, token } = await createUserHelper(app, createUserDto);

      // Create two tasks for the user in the database
      const tasksToCreate = [{ content: 'Task 1' }, { content: 'Task 2' }, { content: 'Task 3' }];

      const tasksService = app.get<TasksService>(TasksService);
      for (const createTaskDto of tasksToCreate) {
        await tasksService.create(createdUser.id, createTaskDto);
      }

      const take = 2;

      const response = await request(app.getHttpServer())
        .get('/v1/task')
        .set('Authorization', `Bearer ${token}`)
        .query({
          take,
        })
        .expect(HttpStatus.OK);

      expect(response.body.tasks).toHaveLength(take);
      expect(response.body.total).toBe(tasksToCreate.length);
      expect(response.body.tasks[0].content).toBe(tasksToCreate[2].content);
      expect(response.body.tasks[1].content).toBe(tasksToCreate[1].content);
      expect(response.body.currEndId).toBe(response.body.tasks[1].id);

      // Check if the cache is populated
      const cache = app.get<Cache>(CACHE_MANAGER);
      const keys = await cache.store.keys();

      expect(keys).toHaveLength(take);
      expect(keys).toEqual(
        expect.arrayContaining([
          `tasks:${createdUser.id}:findAll:START:${take}:ALL:ALL`,
          `tasks:${createdUser.id}:findAll:START:${take}:ALL:ALL-count`,
        ])
      );
    });

    it('should return an empty array if there are no tasks for the authenticated user', async () => {
      expect.assertions(2);

      const { token } = await createUserHelper(app, createUserDto);

      const response = await request(app.getHttpServer())
        .get('/v1/task')
        .set('Authorization', `Bearer ${token}`)
        .query({
          take: 10,
        })
        .expect(HttpStatus.OK);

      expect(response.body.tasks).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });
  });

  describe('GET /v1/task/:id', () => {
    it('should return the task with the specified id for the authenticated user', async () => {
      expect.assertions(5);

      const { createdUser, token } = await createUserHelper(app, createUserDto);

      const createTaskDto = { content: 'Test task content' };
      const { body: createdTask } = await request(app.getHttpServer())
        .post('/v1/task')
        .set('Authorization', `Bearer ${token}`)
        .send(createTaskDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .get(`/v1/task/${createdTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        id: createdTask.id,
        content: createdTask.content,
        isCompleted: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        deletedAt: null,
        userId: createdUser.id,
      });

      const createdAtDate = DateTime.fromISO(response.body.createdAt, { setZone: true });
      expect(createdAtDate.toString()).toBe(response.body.createdAt);

      const updatedAtDate = DateTime.fromISO(response.body.updatedAt, { setZone: true });
      expect(updatedAtDate.toString()).toBe(response.body.updatedAt);

      // Check if the cache is populated
      const cache = app.get<Cache>(CACHE_MANAGER);
      const keys = await cache.store.keys();

      expect(keys).toHaveLength(1);
      expect(keys).toEqual(expect.arrayContaining([`tasks:${createdUser.id}:findOne:${createdTask.id}`]));
    });

    it('should return a 404 not found if the task with the specified id does not exist', async () => {
      expect.assertions(1);

      const { token } = await createUserHelper(app, createUserDto);

      const nonExistingTaskId = '123';
      const response = await request(app.getHttpServer())
        .get(`/v1/task/${nonExistingTaskId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body?.message).toBe('Not Found');
    });
  });

  describe('POST /v1/task/:id', () => {
    it('should update the task with the specified id for the authenticated user', async () => {
      expect.assertions(5);

      const { createdUser, token } = await createUserHelper(app, createUserDto);

      const createTaskDto = { content: 'Test task content' };
      const { body: createdTask } = await request(app.getHttpServer())
        .post('/v1/task')
        .set('Authorization', `Bearer ${token}`)
        .send(createTaskDto)
        .expect(HttpStatus.CREATED);

      // Manual add record in cache
      const cache = app.get<Cache>(CACHE_MANAGER);
      await cache.set(`tasks:${createdUser.id}:findOne:${createdTask.id}`, createdTask);
      await cache.set(`tasks:${createdUser.id}:ABCDE`, createdTask);
      await cache.set(`tasks:HELLO:WORLD`, createdTask);

      const updateTaskDto = { content: 'Updated task content' };
      const { body: updatedTask } = await request(app.getHttpServer())
        .post(`/v1/task/${createdTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateTaskDto)
        .expect(HttpStatus.CREATED);

      expect(updatedTask).toEqual({
        id: createdTask.id,
        content: updateTaskDto.content,
        isCompleted: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        deletedAt: null,
        userId: createdUser.id,
      });

      // Verify if the cache is cleared
      const keys = await cache.store.keys();
      expect(keys).toHaveLength(1);
      expect(keys).toEqual(expect.arrayContaining([`tasks:HELLO:WORLD`]));

      const createdAtDate = DateTime.fromISO(updatedTask.createdAt, { setZone: true });
      expect(createdAtDate.toString()).toBe(updatedTask.createdAt);

      const updatedAtDate = DateTime.fromISO(updatedTask.updatedAt, { setZone: true });
      expect(updatedAtDate.toString()).toBe(updatedTask.updatedAt);
    });

    it('should return a 404 not found if the task with the specified id does not exist', async () => {
      expect.assertions(1);

      const { token } = await createUserHelper(app, createUserDto);

      const nonExistingTaskId = '123';
      const response = await request(app.getHttpServer())
        .post(`/v1/task/${nonExistingTaskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Updated task content' })
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body?.message).toBe('Not Found');
    });
  });

  describe('DELETE /v1/task/:id', () => {
    it('should delete the task with the specified id for the authenticated user', async () => {
      expect.assertions(4);

      const { createdUser, token } = await createUserHelper(app, createUserDto);

      const createTaskDto = { content: 'Test task content' };
      const { body: createdTask } = await request(app.getHttpServer())
        .post('/v1/task')
        .set('Authorization', `Bearer ${token}`)
        .send(createTaskDto)
        .expect(HttpStatus.CREATED);

      // Manual add record in cache
      const cache = app.get<Cache>(CACHE_MANAGER);
      await cache.set(`tasks:${createdUser.id}:findOne:${createdTask.id}`, createdTask);
      await cache.set(`tasks:${createdUser.id}:ABCDE`, createdTask);
      await cache.set(`tasks:HELLO:WORLD`, createdTask);

      const response = await request(app.getHttpServer())
        .delete(`/v1/task/${createdTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(1);

      // Verify if the cache is cleared
      const keys = await cache.store.keys();
      expect(keys).toHaveLength(1);
      expect(keys).toEqual(expect.arrayContaining([`tasks:HELLO:WORLD`]));

      // Verify if the task was deleted from the database
      const taskRepository = app.get<Repository<Task>>(getRepositoryToken(Task));
      const deletedTask = await taskRepository.findOneBy({ id: createdTask.id });
      expect(deletedTask).toBeNull();

      // Verify if the task is not found when fetching by id
      await request(app.getHttpServer())
        .get(`/v1/task/${createdTask.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return a 404 not found if the task with the specified id does not exist', async () => {
      expect.assertions(1);

      const { token } = await createUserHelper(app, createUserDto);

      const nonExistingTaskId = '123';
      const response = await request(app.getHttpServer())
        .delete(`/v1/task/${nonExistingTaskId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.NOT_FOUND);

      expect(response.body?.message).toBe('Not Found');
    });
  });
});
