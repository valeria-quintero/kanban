import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTaskInput, MoveTaskInput, Task, UpdateTaskInput } from "../types/task";
import { createTask, moveTask, updateTask } from "./tasks.service";

// Prefijo común de todas las queries de useTask (['Task', priority])
const TASKS_KEY = ['Task']

export function useCreateTask() {
    //Trae la "caja de cachés" de TanStack Query
    const queryClient = useQueryClient()

    //Cambia datos en el servidor
    return useMutation({
        //Función que hace la petición
        mutationFn: (input: CreateTaskInput) => createTask(input),
        //Se ejecuta cuando la petición termina
        onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
    })
}

export function useUpdateTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, input }: { id: string, input: UpdateTaskInput }) => updateTask(id, input),
        onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
    })
}

//optimista
export function useMoveTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, move }: { id: string, move: MoveTaskInput }) => moveTask(id, move),
        // Mueve la tarjeta en caché antes de que responda el servidor
        onMutate: async ({ id, move }) => {
            //cancela cualquier descarga de lista que esté en camino
            await queryClient.cancelQueries({ queryKey: TASKS_KEY })
            //toma una copia de seguridad de la foto, como un screenshot
            const previous = queryClient.getQueriesData<Task[]>({ queryKey: TASKS_KEY })
            //cambia la foto, llamando a applymove
            queryClient.setQueriesData<Task[]>(
                { queryKey: TASKS_KEY },
                (tasks) => tasks && applyMove(tasks, id, move),
            )
            //gaurda el screenshot para usarlo si algo sale mal
            return { previous }
        },
        // Si falla, vuelve al estado anterior
        onError: (_error, _variables, context) => {
            context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data))
        },
        // El refetch trae los orderIndex reales calculados por la API
        onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
    })
}

// Un índice fraccionario deja la tarjeta justo en su nueva posición sin
// recalcular el resto. Funciona también en las listas filtradas por prioridad.
function applyMove(tasks: Task[], id: string, { status, newOrderIndex }: MoveTaskInput): Task[] {
    const moved = tasks.find((t) => t.id === id)
    if (!moved) return tasks

    const movingDown = moved.status === status && newOrderIndex > moved.orderIndex
    const orderIndex = newOrderIndex + (movingDown ? 0.5 : -0.5)

    return tasks
        .map((t) => (t.id === id ? { ...t, status, orderIndex } : t))
        .sort((a, b) => a.orderIndex - b.orderIndex)
}
