import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { ConfigTestingModule, JwtTestingModule, LoggerTestingModule } from '../../test/modules';
import { BadRequestException } from '@nestjs/common';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { mockTask, mockTaskId, mockUserId } from '../../test/entities';

describe('TasksController', () => {
  let controller: TasksController;
  let service: DeepMocked<TasksService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigTestingModule(),
        LoggerTestingModule(),
        JwtTestingModule(),
        // TypeOrmTestingModule([User, Task]),
        // CacheTestingModule(),
        // TypeOrmModule.forFeature([Task]),
      ],
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: createMock<TasksService>(),
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<DeepMocked<TasksService>>(TasksService);
  });

  it('should be defined', () => {
    expect.assertions(2);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task and return the created task', async () => {
      expect.assertions(2);

      const request = { payload: { sub: mockUserId } };
      const createTaskDto = { content: 'New task content', isCompleted: true };

      // Mock the tasksService.create method to return the created task
      const mockCreatedTask = mockTask(mockUserId, mockTaskId, createTaskDto);
      service.create.mockResolvedValue(mockCreatedTask);

      // Call the controller method
      const result = await controller.create(createTaskDto, request);

      // Check the result
      expect(service.create).toHaveBeenCalledWith(mockUserId, createTaskDto);
      expect(result).toEqual(mockCreatedTask);
    });

    it('should throw BadRequestException if tasksService.create throws an error', async () => {
      expect.assertions(1);

      const userId = undefined;
      const request = { payload: { sub: userId } };
      const createTaskDto = { content: 'New task content' };

      // Mock the service.create method to throw a BadRequestException
      service.create.mockRejectedValue(new BadRequestException());

      // Call the controller method and expect it to throw a BadRequestException
      await expect(controller.create(createTaskDto, request)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should find all tasks and return the list of tasks', async () => {
      expect.assertions(2);

      const request = { payload: { sub: mockUserId } };
      const findAllTaskDto = { take: 10 };

      // Mock the tasksService.findAll method to return a list of tasks
      const mockTasksList = {
        tasks: [
          mockTask(mockUserId, '456', { content: 'Task 456', isCompleted: false }),
          mockTask(mockUserId, '123', { content: 'Task 123', isCompleted: true }),
        ],
        total: 2,
        currEndId: '123',
      };
      service.findAll.mockResolvedValue(mockTasksList);

      // Call the controller method
      const result = await controller.findAll(request, findAllTaskDto);

      // Check the result
      expect(service.findAll).toHaveBeenCalledWith(mockUserId, findAllTaskDto);
      expect(result).toEqual(mockTasksList);
    });

    it('should throw BadRequestException if tasksService.findAll throws an error', async () => {
      expect.assertions(1);

      const userId = undefined;
      const request = { payload: { sub: userId } };
      const findAllTaskDto = { take: 10 };

      // Mock the tasksService.remove method to throw a BadRequestException
      service.findAll.mockRejectedValue(new BadRequestException());

      // Call the controller method and expect it to throw a BadRequestException
      await expect(controller.findAll(request, findAllTaskDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should find and return a task', async () => {
      expect.assertions(2);

      const request = { payload: { sub: mockUserId } };

      // Mock the tasksService.findOne method to return a task
      const task = mockTask(mockUserId, mockTaskId);
      service.findOne.mockResolvedValue(task);

      // Call the controller method
      const result = await controller.findOne(request, mockTaskId);

      // Check the result
      expect(service.findOne).toHaveBeenCalledWith(mockUserId, mockTaskId);
      expect(result).toEqual(task);
    });

    it('should throw BadRequestException if tasksService.update throws an error', async () => {
      expect.assertions(1);

      const request = { payload: { sub: undefined } };

      // Mock the service.findOne method to throw a BadRequestException
      service.findOne.mockRejectedValue(new BadRequestException());

      // Call the controller method and expect it to throw a BadRequestException
      await expect(controller.findOne(request, mockTaskId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update the task and return the updated task', async () => {
      expect.assertions(2);

      const request = { payload: { sub: mockUserId } };
      const updateTaskDto = { content: 'Updated task content', isCompleted: true };

      // Mock the tasksService.update method to return the updated task
      const mockUpdatedTask = mockTask(mockUserId, mockTaskId, updateTaskDto);
      service.update.mockResolvedValue(mockUpdatedTask);

      // Call the controller method
      const result = await controller.update(request, mockTaskId, updateTaskDto);

      // Check the result
      expect(service.update).toHaveBeenCalledWith(mockUserId, mockTaskId, updateTaskDto);
      expect(result).toEqual(mockUpdatedTask);
    });

    it('should throw BadRequestException if tasksService.update throws an error', async () => {
      expect.assertions(1);

      const request = { payload: { sub: undefined } };
      const updateTaskDto = { content: 'Updated task content', isCompleted: true };

      // Mock the tasksService.update method to throw a BadRequestException
      service.update.mockRejectedValue(new BadRequestException());

      // Call the controller method and expect it to throw a BadRequestException
      await expect(controller.update(request, mockTaskId, updateTaskDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove the task and return the removed task', async () => {
      expect.assertions(2);

      const request = { payload: { sub: mockUserId } };

      // Mock the tasksService.remove method to return the removed task
      service.remove.mockResolvedValue(1);

      // Call the controller method
      const result = await controller.remove(request, mockTaskId);

      // Check the result
      expect(service.remove).toHaveBeenCalledWith(mockUserId, mockTaskId);
      expect(result).toEqual(1);
    });

    it('should throw BadRequestException if tasksService.remove throws an error', async () => {
      expect.assertions(1);

      const request = { payload: { sub: undefined } };

      // Mock the tasksService.remove method to throw a BadRequestException
      service.remove.mockRejectedValue(new BadRequestException());

      // Call the controller method and expect it to throw a BadRequestException
      await expect(controller.remove(request, mockTaskId)).rejects.toThrow(BadRequestException);
    });
  });
});
