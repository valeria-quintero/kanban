import { useQuery } from "@tanstack/react-query";
import { mockTasks } from "./tasks.mock";
import type { Priority } from "../constants/priorities";
import type { Task } from "../types/task";

export function useTask(priority?: Priority) {
    const query = useQuery({
        queryKey: ['Task'],
        queryFn: () => {
            const response = mockTasks
            if (!response) throw new Error ('Imposible conectarse con la API')
            return response as Task[]
        },
        staleTime: 30_000,

    })

    return {
        tasks: query.data ? query.data : []
    }
}