import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './config/configuration';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService<ConfigType>) {}

  getHello(): string {
    return 'Hello World!';
  }
}
