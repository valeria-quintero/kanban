import { request } from "../api/tasks";
import type { Priority } from "../constants/priorities";
import type { CreateTaskInput, Task } from "../types/task";

export function getTasks(priority?: Priority): Promise<Task[]> {
  const path = priority ? `/tasks?priority=${priority}` : '/tasks'
  return request<Task[]>(path)
}

export async function createTask(task:CreateTaskInput): Promise<Task> {
    return request<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(task)
    })
}