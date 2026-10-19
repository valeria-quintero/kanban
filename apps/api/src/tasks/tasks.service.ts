import { Injectable, NotFoundException } from '@nestjs/common';
import type { Task as TaskDto } from '@kanban/shared';
import { Prisma, type Task } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { MoveTaskDto } from './dto/move-task.dto.js';
import { QueryTasksDto } from './dto/query-tasks.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

// Convierte la fila de Prisma al contrato compartido con el front.
// La asignación también valida en compilación que los enums de Prisma
// y los de @kanban/shared no se hayan desincronizado.
function toTask(task: Task): TaskDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? undefined,
    status: task.status,
    priority: task.priority,
    orderIndex: task.orderIndex,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll({ priority }: QueryTasksDto): Promise<TaskDto[]> {
    const tasks = await this.prisma.task.findMany({
      where: { priority },
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
    });
    return tasks.map(toTask);
  }

  async create(dto: CreateTaskDto): Promise<TaskDto> {
    const status = dto.status ?? 'BACKLOG';

    // La tarjeta nueva va al final de su columna.
    const task = await this.prisma.$transaction(async (tx) => {
      const { _max } = await tx.task.aggregate({
        where: { status },
        _max: { orderIndex: true },
      });
      return tx.task.create({
        data: {
          title: dto.title,
          description: dto.description,
          status,
          priority: dto.priority,
          orderIndex: (_max.orderIndex ?? -1) + 1,
        },
      });
    });
    return toTask(task);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskDto> {
    try {
      const task = await this.prisma.task.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          priority: dto.priority,
        },
      });
      return toTask(task);
    } catch (error) {
      throw this.notFoundIfMissing(error, id);
    }
  }

  /**
   * Cambia la tarjeta de estado/posición y mantiene los índices de cada
   * columna contiguos (0..n-1), todo en una única transacción.
   */
  async move(id: string, dto: MoveTaskDto): Promise<TaskDto> {
    const moved = await this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id } });
      if (!task) throw new NotFoundException(`Task ${id} not found`);

      const { status: from, orderIndex: oldIndex } = task;
      const to = dto.status;

      if (from === to) {
        const count = await tx.task.count({ where: { status: to } });
        const newIndex = Math.min(dto.newOrderIndex, count - 1);

        if (newIndex > oldIndex) {
          await tx.task.updateMany({
            where: { status: to, orderIndex: { gt: oldIndex, lte: newIndex } },
            data: { orderIndex: { decrement: 1 } },
          });
        } else if (newIndex < oldIndex) {
          await tx.task.updateMany({
            where: { status: to, orderIndex: { gte: newIndex, lt: oldIndex } },
            data: { orderIndex: { increment: 1 } },
          });
        }
        return tx.task.update({ where: { id }, data: { orderIndex: newIndex } });
      }

      // Cambio de columna: cerrar el hueco en el origen y abrir sitio en el destino.
      await tx.task.updateMany({
        where: { status: from, orderIndex: { gt: oldIndex } },
        data: { orderIndex: { decrement: 1 } },
      });

      const destCount = await tx.task.count({ where: { status: to } });
      const newIndex = Math.min(dto.newOrderIndex, destCount);
      await tx.task.updateMany({
        where: { status: to, orderIndex: { gte: newIndex } },
        data: { orderIndex: { increment: 1 } },
      });
      return tx.task.update({
        where: { id },
        data: { status: to, orderIndex: newIndex },
      });
    });
    return toTask(moved);
  }

  private notFoundIfMissing(error: unknown, id: string) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return new NotFoundException(`Task ${id} not found`);
    }
    return error;
  }
}
