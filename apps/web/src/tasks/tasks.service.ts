import { request } from "../api/tasks";

interface User {
    id: number,
    name: string,
    email: string
}

interface Task {
    id: number,
    title: string,
    status: string
}

export async function getUsers(): Promise<User[]> {
    return request<User[]>('/users')
}

export async function getTasks(): Promise<Task[]> {
    return request<Task[]>('/tasks')
}

export async function createTask(title:string): Promise<Task> {
    return request<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify({
            title: title
        })
    })
}