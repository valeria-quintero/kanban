import { useQuery } from "@tanstack/react-query";
import { getTasks } from "./tasks.service";
import type { PriorityFilter } from "../constants/priorities";
import { useTaskStore } from "./use-task-storage";


export function useTask(priorityOverride?: PriorityFilter) {

    const storePriority = useTaskStore((s) => s.priority)

    //Si pasan una prioridad con el hook-usarla
    //si no-usar el store
    const priority = priorityOverride ?? storePriority

    const query = useQuery({
        queryKey: ['Task', priority],
        queryFn: () => getTasks(priority),
        staleTime: 30_000,

    })

    return {
        tasks: query.data ? query.data : []
    }
}