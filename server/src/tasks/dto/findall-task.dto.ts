import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class FindAllTaskDto {
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(20)
  public take!: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsOptional()
  public prevEndId?: number;

  @IsString()
  @IsOptional()
  public content?: string;

  @Transform(({ value }) => Boolean(value))
  @IsBoolean()
  @IsOptional()
  public isCompleted?: boolean;
}
