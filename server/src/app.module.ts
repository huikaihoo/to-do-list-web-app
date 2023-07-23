import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import configuration, { config } from './config/configuration';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import { Task } from './tasks/entities/task.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: config.POSTGRES_HOST,
      port: config.POSTGRES_PORT,
      username: config.POSTGRES_USER,
      password: config.POSTGRES_PASSWORD,
      database: config.POSTGRES_DB,
      entities: [User, Task],
      synchronize: true,
      cache: {
        alwaysEnabled: true,
        type: 'ioredis',
        duration: config.REDIS_CACHE_TTL,
        options: {
          host: config.REDIS_HOST,
          port: config.REDIS_PORT,
          password: config.REDIS_PASSWORD,
        },
      },
    }),
    TypeOrmModule.forFeature([User, Task]),
    UsersModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
