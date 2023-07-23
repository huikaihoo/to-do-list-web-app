import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { FindAllTaskDto } from './dto/findall-task.dto';
import _ from 'lodash';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../config/configuration';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { handleError } from '../utils/error';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private configService: ConfigService<ConfigType>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(TasksService.name);
  }

  async create(userId: string, createTaskDto: CreateTaskDto) {
    if (_.isEmpty(userId)) {
      throw new BadRequestException('userId is required');
    }

    try {
      const task = this.taskRepository.create(createTaskDto);
      task.user = new User({ id: userId });

      await this.taskRepository.save(task);
      return task;
    } catch (error: any) {
      this.logger.error(error);
      return handleError(error);
    }
  }

  async findAll(userId: string, findAllTaskDto: FindAllTaskDto) {
    if (_.isEmpty(userId)) {
      throw new BadRequestException('userId is required');
    }

    const { prevEndId, take, content, isCompleted } = findAllTaskDto; // Renamed prevEnd to prevEndId

    const normalizedContent = content?.toLowerCase();
    const filter: any = {
      userId,
    };
    if (content) {
      filter.content = { $iLike: `%${normalizedContent}%` };
    }
    if (typeof isCompleted === 'boolean') {
      filter.isCompleted = isCompleted;
    }

    const query = this.taskRepository.createQueryBuilder().select().where(filter);
    if (prevEndId) {
      query.andWhere('id < :prevEndId', { prevEndId });
    }
    query.orderBy('id', 'DESC').take(take);

    query.cache(
      `tasks:${userId}:findAll:${prevEndId ?? 'START'}:${take}:${content ?? 'ALL'}:${isCompleted ?? 'ALL'}`,
      this.getRedisCacheTtl()
    );

    try {
      const [tasks, total] = await query.getManyAndCount();

      let currEndId: string;
      if (tasks.length > 0) {
        currEndId = tasks[tasks.length - 1].id;
      } else {
        currEndId = 'END';
      }

      return { tasks, total, currEndId };
    } catch (error: any) {
      this.logger.error(error);
      return handleError(error);
    }
  }

  async findOne(userId: string, id: string) {
    if (_.isEmpty(userId)) {
      throw new BadRequestException('userId is required');
    }

    try {
      const task = await this.taskRepository.findOneOrFail({
        where: { id },
        cache: {
          id: `tasks:${userId}:findOne:${id}`,
          milliseconds: this.getRedisCacheTtl(),
        },
      });
      if (task.userId !== userId) {
        return new ForbiddenException();
      }
      return task;
    } catch (error: any) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException();
      }
      this.logger.error(error);
      return handleError(error);
    }
  }

  async update(userId: string, id: string, updateTaskDto: UpdateTaskDto) {
    if (_.isEmpty(userId)) {
      throw new BadRequestException('userId is required');
    }

    try {
      const taskToUpdate = await this.taskRepository.findOneByOrFail({ id });
      if (taskToUpdate.userId !== userId) {
        return new ForbiddenException();
      }
      await this.deleteRedisCache(userId);

      await this.taskRepository.update({ id }, updateTaskDto);
      return this.taskRepository.merge(taskToUpdate, updateTaskDto);
    } catch (error: any) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException();
      }
      this.logger.error(error);
      return handleError(error);
    }
  }

  async remove(userId: string, id: string) {
    if (_.isEmpty(userId)) {
      throw new BadRequestException('userId is required');
    }

    try {
      const taskToDelete = await this.taskRepository.findOneBy({ id });
      if (!taskToDelete) {
        return new NotFoundException();
      }
      if (taskToDelete.userId !== userId) {
        return new ForbiddenException();
      }
      await this.deleteRedisCache(userId);

      const deleteResult = await this.taskRepository.softDelete({ id });
      return deleteResult.affected ?? 0; // Return the number of records deleted successfully
    } catch (error: any) {
      this.logger.error(error);
      return handleError(error);
    }
  }

  private getRedisCacheTtl(): number {
    const ttl = this.configService.get('REDIS_CACHE_TTL', { infer: true });
    return ttl ?? 60_000;
  }

  // Get all keys that start with `tasks:${userId}:*`
  private async deleteRedisCache(userId: string) {
    const keys = await this.cacheManager.store.keys(`tasks:${userId}:*`);
    this.logger.debug(`deleteRedisCache userId=${userId} size=${keys.length}`);

    await Promise.all(keys.map(key => this.cacheManager.del(key)));
  }
}
