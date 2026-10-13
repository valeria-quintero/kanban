import type { TaskStatus } from '../constants/status';
import type { Priority } from '../constants/priorities';

export interface Task {
    id: string
    title: string
    description?: string
    status: TaskStatus
    priority: Priority
    orderIndex: number
    createdAt: string
    updatedAt: string
}

export interface CreateTaskInput {
    title: string
    description?: string
    priority: Priority
}

export interface UpdateTaskInput {
    title?: string
    description?: string
    priority?: Priority
}

export interface MoveTaskInput {
    status: TaskStatus
    newOrderIndex: number
}