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
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: config.LOG_LEVEL,
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
            ignore: 'pid,hostname',
            suppressFlushSyncWarning: true,
            colorize: true,
            singleLine: true,
          },
        },
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          url: `redis://${config.REDIS_HOST}:${config.REDIS_PORT}`,
          password: config.REDIS_PASSWORD,
          ttl: config.REDIS_CACHE_TTL,
        }),
      }),
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
      dropSchema: process.env.NODE_ENV === 'test',
      cache: {
        alwaysEnabled: false,
        type: 'redis',
        duration: config.REDIS_CACHE_TTL,
        options: {
          host: config.REDIS_HOST,
          port: config.REDIS_PORT,
          password: config.REDIS_PASSWORD,
        },
      },
    }),
    TypeOrmModule.forFeature([User, Task]),
    AuthModule,
    UsersModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
