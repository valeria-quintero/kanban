import { request } from "../api/tasks";
import type { PriorityFilter } from "../constants/priorities";
import type { CreateTaskInput, MoveTaskInput, Task, UpdateTaskInput } from "../types/task";

export function getTasks(priority?: PriorityFilter): Promise<Task[]> {
  const path = priority && priority !== 'All'
    ? `/tasks?priority=${priority}`
    : '/tasks'
  return request<Task[]>(path)
}

export async function createTask(task:CreateTaskInput): Promise<Task> {
    return request<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(task)
    })
}

export async function updateTask(id: string, task:UpdateTaskInput): Promise<Task> {
    return request<Task>(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(task)
    })
}

export async function moveTask(id: string, move:MoveTaskInput): Promise<Task> {
    return request<Task>(`/tasks/${id}/move`, {
        method: 'PATCH',
        body: JSON.stringify(move)
    })
}

export async function deleteTask(id: string): Promise<void> {
    return request<void>(`/tasks/${id}`, { 
        method: 'DELETE' 
    })
}