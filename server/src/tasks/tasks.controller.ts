import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtPayload } from 'jsonwebtoken';
import { FindAllTaskDto } from './dto/findall-task.dto';

@Controller('v1/task')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() request: { payload: JwtPayload }) {
    return this.tasksService.create(request.payload.sub ?? '', createTaskDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Request() request: { payload: JwtPayload }, @Query() findAllTaskDto: FindAllTaskDto) {
    return this.tasksService.findAll(request.payload.sub ?? '', findAllTaskDto);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Request() request: { payload: JwtPayload }, @Param('id') id: string) {
    return this.tasksService.findOne(request.payload.sub ?? '', +id);
  }

  @UseGuards(AuthGuard)
  @Post(':id')
  update(@Request() request: { payload: JwtPayload }, @Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(request.payload.sub ?? '', +id, updateTaskDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Request() request: { payload: JwtPayload }, @Param('id') id: string) {
    return this.tasksService.remove(request.payload.sub ?? '', +id);
  }
}
