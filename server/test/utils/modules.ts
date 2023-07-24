import { ConfigModule } from '@nestjs/config';
import configuration from '../../src/config/configuration';
import { LoggerModule } from 'nestjs-pino';
import { JwtModule } from '@nestjs/jwt';
import { mockJwtSecret } from './entities';

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

export { ConfigTestingModule, LoggerTestingModule, JwtTestingModule };
