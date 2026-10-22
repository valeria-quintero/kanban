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
      //filtro
      where: { priority },
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
    });
    return tasks.map(toTask);
  }

  async create(dto: CreateTaskDto): Promise<TaskDto> {
    //si no se manda status, se usa BACKLOG
    const status = dto.status ?? 'BACKLOG';

    // La tarjeta nueva va al final de su columna.
    const task = await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('kanban:task-order'))`;

      // cuál es el orderIndex más grande en esa columna
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
          // si -max.orderIndex es null (-1 + 1 = 0)
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
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('kanban:task-order'))`;

      //Busca la tarjeta, si no existe = 404
      const task = await tx.task.findUnique({ where: { id } });
      if (!task) throw new NotFoundException(`Task ${id} not found`);

      //Guarda de dónde viene
      const { status: from, orderIndex: oldIndex } = task;
      //y a dónde va
      const to = dto.status;

      //La tarea se queda en la misma columna:
      if (from === to) {
        //cuenta cuántas hay
        const count = await tx.task.count({ where: { status: to } });
        //la ajusta a la última posición
        const newIndex = Math.min(dto.newOrderIndex, count - 1);

        //Si se pasa de la posición 0 a la 2
        if (newIndex > oldIndex) {
          await tx.task.updateMany({
            //busca las tareas mayores a 0 y menores o iguales a 2
            where: { status: to, orderIndex: { gt: oldIndex, lte: newIndex } },
            //les resta 1 para mantener coherencia en los índices
            data: { orderIndex: { decrement: 1 } },
          });
          //Si se pasa de la posición 3 a la 1
        } else if (newIndex < oldIndex) {
          await tx.task.updateMany({
            //Busca las tareas mayores o iguales a 1 y menores a 3
            where: { status: to, orderIndex: { gte: newIndex, lt: oldIndex } },
            //les aumenta 1 para mantener la coherencia y evitar huecos
            data: { orderIndex: { increment: 1 } },
          });
        }
        return tx.task.update({ where: { id }, data: { orderIndex: newIndex } });
      }

      // Cambio de columna: cerrar el hueco en el origen y abrir sitio en el destino.
      await tx.task.updateMany({
        //de la columna de origen, los índices que sean mayores al índice de la tarea que se va
        where: { status: from, orderIndex: { gt: oldIndex } },
        //se les quita 1
        data: { orderIndex: { decrement: 1 } },
      });

      //cuenta las tareas que hay en el destino
      const destCount = await tx.task.count({ where: { status: to } });

      //Math.min busca el menor entre el índice que tendrá la tarea que se mueve y la cuenta de las tareas de la columna de destino para establecer un tope.
      const newIndex = Math.min(dto.newOrderIndex, destCount);
      await tx.task.updateMany({
        //en la columna del destino, los índices que sean mayores o iguales al índice que llega
        where: { status: to, orderIndex: { gte: newIndex } },
        //se les aumenta 1
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

  /** Borra la tarjeta y cierra el hueco para que los índices sigan siendo 0..n-1. */
  async remove(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('kanban:task-order'))`;

      const task = await tx.task.findUnique({ where: { id } });
      if (!task) throw new NotFoundException(`Task ${id} not found`);

      await tx.task.delete({ where: { id } });

      await tx.task.updateMany({
        where: { status: task.status, orderIndex: { gt: task.orderIndex } },
        data: { orderIndex: { decrement: 1 } },
      });
    });
  }
}
