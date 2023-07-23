import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  public content!: string;

  @IsBoolean()
  @IsOptional()
  public isCompleted?: boolean;
}
