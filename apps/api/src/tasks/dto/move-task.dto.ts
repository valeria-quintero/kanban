import { IsEnum, IsInt, Min } from 'class-validator';
import { TASK_STATUS, type MoveTaskInput, type TaskStatus } from '@kanban/shared';

export class MoveTaskDto implements MoveTaskInput {
  @IsEnum(TASK_STATUS)
  status: TaskStatus;

  @IsInt()
  @Min(0)
  newOrderIndex: number;
}
