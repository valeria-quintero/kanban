import { NotFoundException } from '@nestjs/common';
import { TASK_STATUS, type TaskStatus } from '@kanban/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { TasksService } from './tasks.service.js';

type Board = Record<TaskStatus, string[]>;

const STATUS_VALUES = Object.values(TASK_STATUS);

const prisma = new PrismaService();
// Instancia manual: para probar el servicio no hace falta levantar un módulo de Nest.
const service = new TasksService(prisma);

function emptyBoard(): Board {
  return { BACKLOG: [], IN_PROGRESS: [], REVIEW: [], DONE: [] };
}

/** Crea las tareas de cada columna con orderIndex 0..n-1 y devuelve sus ids por título. */
async function seed(columns: Partial<Board>): Promise<Record<string, string>> {
  const ids: Record<string, string> = {};
  for (const [status, titles] of Object.entries(columns)) {
    for (const [orderIndex, title] of titles.entries()) {
      const task = await prisma.task.create({
        data: { title, status: status as TaskStatus, orderIndex },
      });
      ids[title] = task.id;
    }
  }
  return ids;
}

/** Tablero actual como títulos por columna, en orden de orderIndex. */
async function board(): Promise<Board> {
  const tasks = await prisma.task.findMany({ orderBy: { orderIndex: 'asc' } });
  const result = emptyBoard();
  for (const task of tasks) result[task.status].push(task.title);
  return result;
}

/** Invariante de move: en cada columna los índices son exactamente 0..n-1. */
async function expectContiguous() {
  const tasks = await prisma.task.findMany();
  for (const status of STATUS_VALUES) {
    const indexes = tasks
      .filter((t) => t.status === status)
      .map((t) => t.orderIndex)
      .sort((a, b) => a - b);
    expect(indexes, `índices de ${status}`).toEqual(indexes.map((_, i) => i));
  }
}

async function move(id: string, status: TaskStatus, newOrderIndex: number) {
  const task = await service.move(id, { status, newOrderIndex });
  await expectContiguous();
  return task;
}

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE tasks`;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('TasksService.move — misma columna', () => {
  let ids: Record<string, string>;

  beforeEach(async () => {
    ids = await seed({ BACKLOG: ['A', 'B', 'C', 'D'] });
  });

  it('baja una tarjeta', async () => {
    const task = await move(ids.A, 'BACKLOG', 2);
    expect(task.orderIndex).toBe(2);
    expect((await board()).BACKLOG).toEqual(['B', 'C', 'A', 'D']);
  });

  it('sube una tarjeta', async () => {
    await move(ids.D, 'BACKLOG', 1);
    expect((await board()).BACKLOG).toEqual(['A', 'D', 'B', 'C']);
  });

  it('no cambia nada si el índice es el mismo', async () => {
    await move(ids.B, 'BACKLOG', 1);
    expect((await board()).BACKLOG).toEqual(['A', 'B', 'C', 'D']);
  });

  it('mueve al primer puesto', async () => {
    await move(ids.C, 'BACKLOG', 0);
    expect((await board()).BACKLOG).toEqual(['C', 'A', 'B', 'D']);
  });

  it('mueve al último puesto', async () => {
    await move(ids.B, 'BACKLOG', 3);
    expect((await board()).BACKLOG).toEqual(['A', 'C', 'D', 'B']);
  });

  it('ajusta al final un índice mayor que la columna', async () => {
    const task = await move(ids.A, 'BACKLOG', 99);
    expect(task.orderIndex).toBe(3);
    expect((await board()).BACKLOG).toEqual(['B', 'C', 'D', 'A']);
  });
});

describe('TasksService.move — cambio de columna', () => {
  let ids: Record<string, string>;

  beforeEach(async () => {
    ids = await seed({ BACKLOG: ['A', 'B', 'C'], DONE: ['X', 'Y'] });
  });

  it('cierra el hueco en el origen y abre sitio en el destino', async () => {
    const task = await move(ids.B, 'DONE', 1);
    expect(task.status).toBe('DONE');
    expect(task.orderIndex).toBe(1);
    expect(await board()).toMatchObject({
      BACKLOG: ['A', 'C'],
      DONE: ['X', 'B', 'Y'],
    });
  });

  it('mueve al primer puesto del destino', async () => {
    await move(ids.C, 'DONE', 0);
    expect((await board()).DONE).toEqual(['C', 'X', 'Y']);
  });

  it('mueve a una columna vacía', async () => {
    const task = await move(ids.A, 'REVIEW', 0);
    expect(task.orderIndex).toBe(0);
    expect(await board()).toMatchObject({
      BACKLOG: ['B', 'C'],
      REVIEW: ['A'],
    });
  });

  it('ajusta al final un índice mayor que la columna destino', async () => {
    const task = await move(ids.A, 'DONE', 99);
    expect(task.orderIndex).toBe(2);
    expect((await board()).DONE).toEqual(['X', 'Y', 'A']);
  });

  it('deja vacía la columna origen al mover su última tarjeta', async () => {
    await move(ids.X, 'BACKLOG', 0);
    await move(ids.Y, 'BACKLOG', 0);
    expect(await board()).toMatchObject({
      BACKLOG: ['Y', 'X', 'A', 'B', 'C'],
      DONE: [],
    });
  });
});

describe('TasksService.move — errores', () => {
  it('lanza NotFoundException y no modifica el tablero', async () => {
    await seed({ BACKLOG: ['A', 'B'] });
    const before = await board();

    await expect(
      service.move('00000000-0000-4000-8000-000000000000', {
        status: 'DONE',
        newOrderIndex: 0,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(await board()).toEqual(before);
  });
});

describe('TasksService.move — movimientos aleatorios', () => {
  // PRNG con semilla fija para que un fallo sea reproducible.
  function mulberry32(seed: number) {
    return () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  it('coincide con un modelo en memoria tras 100 movimientos', async () => {
    const random = mulberry32(42);
    const pick = <T>(items: readonly T[]) =>
      items[Math.floor(random() * items.length)];

    const model: Board = {
      BACKLOG: ['A', 'B', 'C', 'D'],
      IN_PROGRESS: ['E', 'F'],
      REVIEW: ['G'],
      DONE: [],
    };
    const ids = await seed(model);
    const titles = Object.keys(ids);

    for (let step = 0; step < 100; step++) {
      const title = pick(titles);
      const to = pick(STATUS_VALUES);
      // Incluye índices fuera de rango para ejercitar el ajuste al final.
      const newOrderIndex = Math.floor(random() * 7);

      const from = STATUS_VALUES.find((s) => model[s].includes(title))!;
      model[from].splice(model[from].indexOf(title), 1);
      model[to].splice(Math.min(newOrderIndex, model[to].length), 0, title);

      await move(ids[title], to, newOrderIndex);
      expect(await board(), `paso ${step}: ${title} → ${to}#${newOrderIndex}`).toEqual(model);
    }
  });
});

describe('TasksService.remove', () => {
  it('borra la tarjeta y cierra el hueco', async () => {
    const ids = await seed({ BACKLOG: ['A', 'B', 'C'], DONE: ['X', 'Y'] });

    await service.remove(ids.B);
    await expectContiguous();

    expect(await board()).toMatchObject({ BACKLOG: ['A', 'C'], DONE: ['X', 'Y'] });
  });

  it('borra la última tarjeta sin tocar a las demás', async () => {
    const ids = await seed({ BACKLOG: ['A', 'B', 'C'] });

    await service.remove(ids.C);
    await expectContiguous();

    expect((await board()).BACKLOG).toEqual(['A', 'B']);
  });

  it('lanza NotFoundException y no modifica el tablero', async () => {
    await seed({ BACKLOG: ['A', 'B'] });
    const before = await board();

    await expect(
      service.remove('00000000-0000-4000-8000-000000000000'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(await board()).toEqual(before);
  });
});
