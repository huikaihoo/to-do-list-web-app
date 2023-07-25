import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '../auth/auth.guard';
import { JwtPayload } from 'jsonwebtoken';
import { FindAllTaskDto } from './dto/findall-task.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('v1/task')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Create task' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() request: { payload: JwtPayload }) {
    return this.tasksService.create(request.payload.sub ?? '', createTaskDto);
  }

  @ApiOperation({ summary: 'Get list of tasks of user' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  findAll(@Request() request: { payload: JwtPayload }, @Query() findAllTaskDto: FindAllTaskDto) {
    return this.tasksService.findAll(request.payload.sub ?? '', findAllTaskDto);
  }

  @ApiOperation({ summary: 'Get task by id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Request() request: { payload: JwtPayload }, @Param('id') id: string) {
    return this.tasksService.findOne(request.payload.sub ?? '', id);
  }

  @ApiOperation({ summary: 'Update task' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post(':id')
  update(@Request() request: { payload: JwtPayload }, @Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(request.payload.sub ?? '', id, updateTaskDto);
  }

  @ApiOperation({ summary: 'Delete task (soft delete)' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Request() request: { payload: JwtPayload }, @Param('id') id: string) {
    return this.tasksService.remove(request.payload.sub ?? '', id);
  }
}
