import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto.js';

export class UpdateTaskDto extends PartialType(
  //PartialType los vuelve todos opcionales
  //PickType toma solo tres campos de CreateTaskDto
  PickType(CreateTaskDto, ['title', 'description', 'priority'] as const),
) {}
