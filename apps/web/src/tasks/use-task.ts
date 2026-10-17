import { useQuery } from "@tanstack/react-query";
import { mockTasks } from "./tasks.mock";
import type { Priority } from "../constants/priorities";
import { useTaskStore } from "./use-task-storage";


export function useTask(priorityOverride?: Priority | 'All') {

    const storePriority = useTaskStore((s) => s.priority)

    //Si pasan una prioridad con el hook-usarla
    //si no-usar el store
    const priority = priorityOverride ?? storePriority

    const query = useQuery({
        queryKey: ['Task', priority],
        queryFn: () => {
            if (priority === 'All') {
                return (
                    mockTasks
                )
            }
                return (
                    mockTasks.filter((t) => t.priority === priority)
                )
        },
        staleTime: 30_000,

    })

    return {
        tasks: query.data ? query.data : []
    }
}