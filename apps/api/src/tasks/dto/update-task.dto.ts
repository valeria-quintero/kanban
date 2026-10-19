import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto.js';

export class UpdateTaskDto extends PartialType(
  PickType(CreateTaskDto, ['title', 'description', 'priority'] as const),
) {}
