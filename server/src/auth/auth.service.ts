import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PinoLogger } from 'nestjs-pino';
import { handleError } from '../utils/error';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(AuthService.name);
  }

  async signIn(username: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findOne({ username });

      // check password with user.password (bcrypt)
      const isMatch = user?.password ? await bcrypt.compare(password, user.password) : false;

      if (user === null || !isMatch) {
        return new UnauthorizedException();
      }

      // Generate a JWT token and return it
      const payload = { sub: user.id };
      return {
        token: await this.jwtService.signAsync(payload),
      };
    } catch (error: any) {
      this.logger.error(error);
      return handleError(error);
    }
  }
}
