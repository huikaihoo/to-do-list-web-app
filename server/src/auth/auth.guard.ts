import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';
import _ from 'lodash';
import { ConfigType } from '../config/configuration';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<ConfigType>,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(AuthGuard.name);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const secret = this.configService.get('JWT_SECRET', { infer: true });
      const payload = await this.jwtService.verifyAsync(token, { secret });
      if (_.isEmpty(payload.sub)) {
        throw new UnauthorizedException();
      }
      request['payload'] = payload;
    } catch (error: any) {
      this.logger.error(error);
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: FastifyRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
