import { IsUUID } from 'class-validator';

export class FindOneUserDto {
  @IsUUID(4)
  public id?: string;

  public username?: string;

  constructor(partial: Partial<FindOneUserDto>) {
    Object.assign(this, partial);
  }
}
