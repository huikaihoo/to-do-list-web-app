import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Task } from './entities/task.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { ConfigTestingModule, LoggerTestingModule, JwtTestingModule } from '../../test/modules';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { mockTask, mockTaskId, mockUser, mockUserId } from '../../test/entities';
import { CreateTaskDto } from './dto/create-task.dto';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FindAllTaskDto } from './dto/findall-task.dto';

describe('TasksService', () => {
  let service: TasksService;
  let repo: DeepMocked<Repository<Task>>;
  let cache: DeepMocked<Cache>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigTestingModule(), LoggerTestingModule(), JwtTestingModule()],
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: createMock<Repository<Task>>(),
        },
        {
          provide: CACHE_MANAGER,
          useValue: createMock<Cache>({
            store: {
              keys: jest.fn().mockResolvedValue([]),
            },
            del: jest.fn(),
          }),
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repo = module.get<DeepMocked<Repository<Task>>>(getRepositoryToken(Task));
    cache = module.get<DeepMocked<Cache>>(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect.assertions(3);

    expect(service).toBeDefined();
    expect(repo).toBeDefined();
    expect(cache).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      expect.assertions(4);

      const user = mockUser(mockUserId);
      const newTask = mockTask(mockUserId, mockTaskId);
      const createTaskDto: CreateTaskDto = {
        content: newTask.content,
        isCompleted: newTask.isCompleted,
      };

      // Mock the taskRepository.create and taskRepository.save methods to return the new task
      repo.create.mockReturnValue(newTask);
      repo.save.mockResolvedValue(newTask);

      // Call the create method
      const result = await service.create(user.id, createTaskDto);

      // Check the result
      expect(repo.create).toHaveBeenCalledWith(createTaskDto);
      expect(newTask.user).toEqual({ id: user.id }); // Make sure the user is set correctly
      expect(repo.save).toHaveBeenCalledWith(newTask);
      expect(result).toEqual(newTask);
    });

    it('should throw an error when userId is empty', async () => {
      expect.assertions(1);

      const createTaskDto: CreateTaskDto = {
        content: 'Task content',
        isCompleted: false,
      };

      // Call the create method and expect it to throw an error
      expect(service.create('', createTaskDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw an error when saving the new task fails', async () => {
      expect.assertions(2);

      const user = mockUser(mockUserId);
      const newTask = mockTask(mockUserId, mockTaskId);
      const createTaskDto: CreateTaskDto = {
        content: newTask.content,
        isCompleted: newTask.isCompleted,
      };

      // Mock the taskRepository.create method to return the new task
      repo.create.mockReturnValue(newTask);

      // Mock the taskRepository.save method to throw an error
      repo.save.mockRejectedValue(new Error());

      // Call the create method and expect it to throw an error
      expect(service.create(user.id, createTaskDto)).rejects.toThrow(BadRequestException);
      expect(repo.create).toHaveBeenCalledWith(createTaskDto);
    });
  });

  describe('findAll', () => {
    it('should find and return tasks based on filters', async () => {
      expect.assertions(5);

      const user = mockUser(mockUserId);
      const tasks = [mockTask(mockUserId, '987'), mockTask(mockUserId, '876'), mockTask(mockUserId, '456')];

      const findAllTaskDto: FindAllTaskDto = {
        prevEndId: 1234, // Set the previous end ID
        take: 3, // Set the number of tasks to retrieve
        content: 'Task content', // Filter tasks based on content
        isCompleted: false, // Filter tasks based on completion status
      };

      // Mock the taskRepository.createQueryBuilder method to return the query builder
      repo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        cache: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([tasks, tasks.length]), // Return the tasks and total count
      } as any);

      // Call the findAll method
      const result = await service.findAll(user.id, findAllTaskDto);

      // Check the result
      expect(result.tasks).toEqual(tasks);
      expect(result.total).toEqual(tasks.length);
      expect(result.currEndId).toEqual('456');
      expect(repo.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(repo.createQueryBuilder().getManyAndCount).toHaveBeenCalledTimes(1);
    });

    it('should find and return tasks without filters', async () => {
      expect.assertions(5);

      const user = mockUser(mockUserId);
      const tasks: Task[] = [];

      const findAllTaskDto: FindAllTaskDto = {
        take: 2,
      };

      // Mock the taskRepository.createQueryBuilder method to return the query builder
      repo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        cache: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([tasks, tasks.length]), // Return the tasks and total count
      } as any);

      // Call the findAll method
      const result = await service.findAll(user.id, findAllTaskDto);

      // Check the result
      expect(result.tasks).toEqual(tasks);
      expect(result.total).toEqual(tasks.length);
      expect(result.currEndId).toEqual('END');
      expect(repo.createQueryBuilder).toHaveBeenCalledTimes(1);
      expect(repo.createQueryBuilder().getManyAndCount).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when retrieving tasks fails', async () => {
      expect.assertions(1);

      const user = mockUser(mockUserId);
      const findAllTaskDto: FindAllTaskDto = {
        take: 2,
      };

      // Mock the taskRepository.createQueryBuilder method to throw an error
      repo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        cache: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockRejectedValue(new Error()), // Simulate an error during retrieval
      } as any);

      // Call the findAll method and expect it to throw an error
      await expect(service.findAll(user.id, findAllTaskDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw a BadRequestException when userId is empty', async () => {
      expect.assertions(1);

      const findAllTaskDto: FindAllTaskDto = {
        take: 2,
      };

      // Call the findAll method and expect it to throw a BadRequestException
      expect(service.findAll('', findAllTaskDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should find and return a task when the task belongs to the user', async () => {
      expect.assertions(2);

      const user = mockUser(mockUserId);
      const task = mockTask(mockUserId, mockTaskId);

      // Mock the taskRepository.findOneOrFail method to return the task
      repo.findOneOrFail.mockResolvedValue(task);

      // Call the findOne method
      const result = await service.findOne(user.id, mockTaskId);

      // Check the result
      expect(repo.findOneOrFail).toHaveBeenCalledWith({
        where: { id: mockTaskId },
        cache: { id: `tasks:${user.id}:findOne:${mockTaskId}`, milliseconds: expect.any(Number) },
      });
      expect(result).toEqual(task);
    });

    it('should throw a NotFoundException when the task is not found', async () => {
      expect.assertions(1);

      const user = mockUser();

      // Mock the taskRepository.findOneOrFail method to throw a EntityNotFoundError
      repo.findOneOrFail.mockRejectedValue(new EntityNotFoundError(Task, ''));

      // Call the findOne method and expect it to throw a NotFoundException
      expect(service.findOne(user.id, mockTaskId)).rejects.toThrow(NotFoundException);
    });

    it('should throw a BadRequestException when userId is empty', async () => {
      expect.assertions(1);

      // Call the findOne method and expect it to throw a BadRequestException
      expect(service.findOne('', mockTaskId)).rejects.toThrow(BadRequestException);
    });

    it('should return ForbiddenException when the task does not belong to the user', async () => {
      expect.assertions(2);

      const user = mockUser(mockUserId);
      const task = mockTask('another-user-id', mockTaskId); // Create a task with a different user ID

      // Mock the taskRepository.findOneOrFail method to return the task with a different user ID
      repo.findOneOrFail.mockResolvedValue(task);

      // Call the findOne method and expect it to return ForbiddenException
      const result = await service.findOne(user.id, mockTaskId);

      // Check the result
      expect(repo.findOneOrFail).toHaveBeenCalledWith({
        where: { id: mockTaskId },
        cache: { id: `tasks:${user.id}:findOne:${mockTaskId}`, milliseconds: expect.any(Number) },
      });
      expect(result).toBeInstanceOf(ForbiddenException);
    });

    it('should throw an error when find task fails', async () => {
      expect.assertions(1);

      const user = mockUser(mockUserId);
      // const task = mockTask(mockUserId, mockTaskId);

      // Mock the taskRepository.findOneOrFail method to return the task
      repo.findOneOrFail.mockRejectedValue(new Error());

      // Call the findOne method and expect it to throw an error
      expect(service.findOne(user.id, mockTaskId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update an existing task', async () => {
      expect.assertions(4);

      const user = mockUser(mockUserId);
      const existingTask = mockTask(mockUserId, mockTaskId);
      const updateTaskDto: UpdateTaskDto = {
        content: 'Updated task content',
        isCompleted: true,
      };

      // Mock the taskRepository.findOneByOrFail and taskRepository.merge methods to return the updated task
      repo.findOneByOrFail.mockResolvedValue(existingTask);
      repo.merge.mockReturnValue({ ...existingTask, ...updateTaskDto });

      // mock store.keys

      // Call the update method
      const result = await service.update(mockUserId, mockTaskId, updateTaskDto);

      // Check the result
      expect(repo.findOneByOrFail).toHaveBeenCalledWith({ id: mockTaskId });
      expect(existingTask.userId).toBe(user.id); // Make sure the task belongs to the user
      expect(repo.merge).toHaveBeenCalledWith(existingTask, updateTaskDto);
      expect(result).toEqual({ ...existingTask, ...updateTaskDto });
    });

    it('should return ForbiddenException when updating a task that does not belong to the user', async () => {
      expect.assertions(2);

      const user = mockUser(mockUserId);
      const existingTask = mockTask('another-user-id', mockTaskId); // Create a task that belongs to another user
      const updateTaskDto: UpdateTaskDto = {
        content: 'Updated task content',
        isCompleted: true,
      };

      // Mock the taskRepository.findOneByOrFail method to return the existing task
      repo.findOneByOrFail.mockResolvedValue(existingTask);

      const result = await service.update(user.id, mockTaskId, updateTaskDto);

      // Call the update method and expect it to throw a ForbiddenException
      expect(result).toBeInstanceOf(ForbiddenException);
      expect(repo.findOneByOrFail).toHaveBeenCalledWith({ id: mockTaskId });
    });

    it('should throw a BadRequestException when userId is empty', async () => {
      expect.assertions(1);

      const updateTaskDto: UpdateTaskDto = {
        content: 'Updated task content',
        isCompleted: true,
      };

      // Call the update method and expect it to throw a BadRequestException
      expect(service.update('', mockTaskId, updateTaskDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw a NotFoundException when the task is not found', async () => {
      expect.assertions(1);

      const user = mockUser(mockUserId);
      const updateTaskDto: UpdateTaskDto = {
        content: 'Updated task content',
        isCompleted: true,
      };

      // Mock the taskRepository.findOneByOrFail to throw a EntityNotFoundError
      repo.findOneByOrFail.mockRejectedValue(new EntityNotFoundError(Task, ''));

      // Call the update method and expect it to throw a NotFoundException
      expect(service.update(user.id, mockTaskId, updateTaskDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw an error when taskRepository.update fails', async () => {
      expect.assertions(2);

      const user = mockUser(mockUserId);
      const existingTask = mockTask(user.id, mockTaskId);
      const updateTaskDto: UpdateTaskDto = {
        content: 'Updated task content',
        isCompleted: true,
      };

      // Mock the taskRepository.findOneByOrFail method to return the existing task
      repo.findOneByOrFail.mockResolvedValue(existingTask);

      // Mock the taskRepository.update method to throw an error
      repo.update.mockRejectedValue(new Error());

      // Call the update method and expect it to throw an error
      await expect(service.update(user.id, mockTaskId, updateTaskDto)).rejects.toThrow(BadRequestException);
      expect(repo.findOneByOrFail).toHaveBeenCalledWith({ id: mockTaskId });
    });
  });

  describe('remove', () => {
    it('should remove an existing task', async () => {
      expect.assertions(3);

      const user = mockUser(mockUserId);
      const existingTask = mockTask(mockUserId, mockTaskId);

      // Mock the taskRepository.findOneBy method to return the existing task
      repo.findOneBy.mockResolvedValue(existingTask);

      // Mock the taskRepository.softDelete method to return a success result
      repo.softDelete.mockResolvedValue({ affected: 1, raw: '', generatedMaps: [] });

      // Call the remove method
      const result = await service.remove(user.id, mockTaskId);

      // Check the result
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: mockTaskId });
      expect(existingTask.userId).toBe(user.id); // Make sure the task belongs to the user
      expect(result).toEqual(1); // The number of records deleted successfully
    });

    it('should return ForbiddenException when removing a task that does not belong to the user', async () => {
      expect.assertions(2);

      const user = mockUser(mockUserId);
      const existingTask = mockTask('another-user-id', mockTaskId); // Create a task that belongs to another user

      // Mock the taskRepository.findOneBy method to return the existing task
      repo.findOneBy.mockResolvedValue(existingTask);

      const result = await service.remove(user.id, mockTaskId);

      // Call the remove method and expect it to throw a ForbiddenException
      expect(result).toBeInstanceOf(ForbiddenException);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: mockTaskId });
    });

    it('should throw a BadRequestException when userId is empty', async () => {
      expect.assertions(1);

      // Call the remove method and expect it to throw a BadRequestException
      expect(service.remove('', mockTaskId)).rejects.toThrow(BadRequestException);
    });

    it('should return a NotFoundException when the task is not found', async () => {
      expect.assertions(1);

      const user = mockUser(mockUserId);

      // Mock the taskRepository.findOneBy to return null
      repo.findOneBy.mockResolvedValue(null);

      // Call the remove method and expect return NotFoundException
      const result = await service.remove(user.id, mockTaskId);
      expect(result).toBeInstanceOf(NotFoundException);
    });

    it('should throw an error when taskRepository.softDelete fails', async () => {
      expect.assertions(2);

      const user = mockUser(mockUserId);
      const existingTask = mockTask(user.id, mockTaskId);

      // Mock the taskRepository.findOneBy method to return the existing task
      repo.findOneBy.mockResolvedValue(existingTask);

      // Mock the taskRepository.softDelete method to throw an error
      repo.softDelete.mockRejectedValue(new Error());

      // Call the remove method and expect it to throw an error
      await expect(service.remove(user.id, mockTaskId)).rejects.toThrow(BadRequestException);
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: mockTaskId });
    });
  });
});
