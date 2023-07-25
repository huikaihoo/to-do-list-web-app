import { Controller, Get, Post, Body, BadRequestException, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FindOneUserDto } from './dto/findone-user.dto';
import { ValidationError, validate } from 'class-validator';
import _ from 'lodash';
import { AuthGuard } from '../auth/auth.guard';
import { JwtPayload } from 'jsonwebtoken';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('v1/user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create user' })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return user.removePassword();
  }

  @ApiOperation({ summary: 'Get user based on jwt token' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  async findOne(@Request() request: { payload: JwtPayload }) {
    const findOneUserDto = new FindOneUserDto({ id: request.payload.sub });
    const errors = await validate(findOneUserDto);
    if (errors.length > 0) {
      const constraints = _.flatMap(errors, (err: ValidationError) => _.values(err.constraints));
      throw new BadRequestException(constraints);
    }

    const user = await this.usersService.findOne(findOneUserDto);
    return user?.removePassword();
  }
}
