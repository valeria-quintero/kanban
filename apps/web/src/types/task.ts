import type { Status } from '../constants/status';
import type { Priority } from '../constants/priorities';

export interface Task {
    id: string,
    title: string,
    description?: string,
    status: Status,
    priority: Priority,
    orderIndex: number,
    createdAt: string,
    updatedAt: string
}