import { useQuery } from "@tanstack/react-query";
import { getTasks } from "./tasks.service";
import type { PriorityFilter } from "../constants/priorities";
import { useTaskStore } from "./use-task-storage";
import type { Task } from "../types/task";

// Siempre el mismo arreglo vacío: si fuera un [] nuevo en cada render,
// el Board creería que los datos cambiaron en cada render
const NO_TASKS: Task[] = []

export function useTask(priorityOverride?: PriorityFilter) {

    const storePriority = useTaskStore((s) => s.priority)

    //Si pasan una prioridad con el hook -> usarla
    //si no -> usar el store
    const priority = priorityOverride ?? storePriority

    //useQuery lee datos del servidor
    const query = useQuery({
        queryKey: ['Task', priority],
        queryFn: () => getTasks(priority),
        staleTime: 30_000,

    })

    return {
        tasks: query.data ?? NO_TASKS
    }
}