import { IsEnum, IsOptional } from 'class-validator';
import { TASK_PRIORITY, type Priority } from '@kanban/shared';

export class QueryTasksDto {
  @IsOptional()
  @IsEnum(TASK_PRIORITY)
  priority?: Priority;
}
