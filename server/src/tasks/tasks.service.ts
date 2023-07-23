import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { FindAllTaskDto } from './dto/findall-task.dto';
import _ from 'lodash';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>
  ) {}

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
      const message = error.detail ?? error.toString();
      throw new BadRequestException(message);
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

    const [tasks, total] = await query.getManyAndCount();

    let currEndId: number | undefined = undefined;
    if (tasks.length > 0) {
      currEndId = tasks[tasks.length - 1].id;
    }

    return { tasks, total, currEndId };
  }

  async findOne(userId: string, id: number) {
    try {
      const task = await this.taskRepository.findOneByOrFail({ id });
      if (task.userId !== userId) {
        throw new ForbiddenException();
      }
      return task;
    } catch (error: any) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException();
      }
      const message = error.detail ?? error.toString();
      throw new BadRequestException(message);
    }
  }

  async update(userId: string, id: number, updateTaskDto: UpdateTaskDto) {
    try {
      const taskToUpdate = await this.taskRepository.findOneByOrFail({ id });
      if (taskToUpdate.userId !== userId) {
        throw new ForbiddenException();
      }
      const updatedTask = this.taskRepository.merge(taskToUpdate, updateTaskDto);
      return this.taskRepository.save(updatedTask);
    } catch (error: any) {
      if (error.name === 'EntityNotFoundError') {
        throw new NotFoundException();
      }
      const message = error.detail ?? error.toString();
      throw new BadRequestException(message);
    }
  }

  async remove(userId: string, id: number) {
    try {
      const taskToDelete = await this.taskRepository.findOneBy({ id });
      if (!taskToDelete) {
        throw new NotFoundException();
      }
      if (taskToDelete.userId !== userId) {
        throw new ForbiddenException();
      }
      const deleteResult = await this.taskRepository.softDelete({ id });
      return deleteResult.affected || 0; // Return the number of records deleted successfully
    } catch (error: any) {
      const message = error.detail ?? error.toString();
      throw new BadRequestException(message);
    }
  }
}
