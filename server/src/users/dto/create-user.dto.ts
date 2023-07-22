import { IsNotEmpty, MinLength } from 'class-validator';
import { config } from '../../config/configuration';
import { Transform } from 'class-transformer';
import bcrypt from 'bcrypt';

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(config.USERNAME_MIN_LENGTH)
  public username!: string;

  @IsNotEmpty()
  @MinLength(config.PASSWORD_MIN_LENGTH)
  @Transform(({ value }) => bcrypt.hashSync(value, config.PASSWORD_SALT), {
    groups: ['transform'],
  })
  public password!: string;
}
