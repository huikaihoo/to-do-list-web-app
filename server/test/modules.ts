import { ConfigModule } from '@nestjs/config';
import configuration, { config } from '../src/config/configuration';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { JwtModule } from '@nestjs/jwt';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheModule } from '@nestjs/cache-manager';
import { mockJwtSecret } from './entities';

const TypeOrmTestingModule = (entities: any[]) =>
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    username: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
    database: config.POSTGRES_DB,
    entities: [...entities],
    synchronize: true,
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
  });

const CacheTestingModule = () =>
  CacheModule.registerAsync({
    isGlobal: true,
    useFactory: async () => ({
      store: await redisStore({
        url: `redis://${config.REDIS_HOST}:${config.REDIS_PORT}`,
        password: config.REDIS_PASSWORD,
        ttl: config.REDIS_CACHE_TTL,
      }),
    }),
  });

const ConfigTestingModule = () =>
  ConfigModule.forRoot({
    load: [configuration],
  });

const LoggerTestingModule = () => LoggerModule.forRoot({});

const JwtTestingModule = () =>
  JwtModule.register({
    secret: mockJwtSecret,
    signOptions: { expiresIn: '1d' },
  });

export { TypeOrmTestingModule, CacheTestingModule, ConfigTestingModule, LoggerTestingModule, JwtTestingModule };
