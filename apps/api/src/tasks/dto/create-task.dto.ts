import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import {
  TASK_PRIORITY,
  TASK_STATUS,
  type CreateTaskInput,
  type Priority,
  type TaskStatus,
} from '@kanban/shared';

export class CreateTaskDto implements Partial<CreateTaskInput> {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TASK_STATUS)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TASK_PRIORITY)
  priority?: Priority;
}
