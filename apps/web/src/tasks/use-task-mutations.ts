import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import type { CreateTaskInput, MoveTaskInput, Task, UpdateTaskInput } from "../types/task";
import { createTask, deleteTask, moveTask, updateTask } from "./tasks.service";
import { toast } from "./use-toast";

// Prefijo común de todas las queries de useTask (['Task', priority])
const TASKS_KEY = ['Task']

export function useCreateTask() {
    //Trae la "caja de cachés" de TanStack Query
    const queryClient = useQueryClient()

    //Cambia datos en el servidor
    return useMutation({
        //Función que hace la petición
        mutationFn: (input: CreateTaskInput) => createTask(input),
        onSuccess: () => toast.success('Tarea creada'),
        //Se ejecuta cuando la petición termina
        onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
    })
}

export function useUpdateTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, input }: { id: string, input: UpdateTaskInput }) => updateTask(id, input),
        onSuccess: () => toast.success('Tarea actualizada'),
        onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
    })
}

export function useDeleteTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => deleteTask(id),
        // Quita la tarjeta de la caché antes de que responda el servidor
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: TASKS_KEY })
            const previous = queryClient.getQueriesData<Task[]>({ queryKey: TASKS_KEY })
            queryClient.setQueriesData<Task[]>(
                { queryKey: TASKS_KEY },
                (tasks) => tasks && tasks.filter((t) => t.id !== id),
            )
            return { previous }
        },
        onSuccess: () => toast.success('Tarea eliminada'),
        // Si falla, vuelve al estado anterior
        onError: (_error, _id, context) => {
            context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data))
        },
        // El refetch trae los orderIndex reales (la API cierra el hueco)
        onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
    })
}

const MOVE_KEY = ['moveTask']

type MoveVariables = {
    id: string
    move: MoveTaskInput
    //copia de seguridad de la caché para deshacer si falla
    previous: [QueryKey, Task[] | undefined][]
}

//optimista
export function useMoveTask() {
    const queryClient = useQueryClient()

    const mutation = useMutation({
        //cuenta cuántos movimientos están en curso
        mutationKey: MOVE_KEY,
        mutationFn: ({ id, move }: MoveVariables) => moveTask(id, move),
        // Si falla, vuelve al estado anterior
        onError: (_error, { previous }) => {
            previous.forEach(([key, data]) => queryClient.setQueryData(key, data))
        },
        // El refetch trae los orderIndex reales calculados por la API.
        // Con varios movimientos seguidos, solo refresca el último: si no, la
        // respuesta de uno anterior pintaría un tablero ya desactualizado.
        onSettled: () => {
            if (queryClient.isMutating({ mutationKey: MOVE_KEY }) === 1) {
                return queryClient.invalidateQueries({ queryKey: TASKS_KEY })
            }
        },
    })

    // Cambia la caché antes de lanzar la petición. Ojo: TanStack avisa a los
    // componentes con un setTimeout(0), así que esto solo no basta para dnd;
    // por eso Board aplica además el movimiento a su estado local.
    const mutate = ({ id, move }: { id: string, move: MoveTaskInput }) => {
        //cancela cualquier descarga de lista en camino
        //(revert: true pisaría el cambio optimista con la caché anterior)
        queryClient.cancelQueries({ queryKey: TASKS_KEY }, { revert: false })
        //toma una copia de seguridad de la foto, como un screenshot
        const previous = queryClient.getQueriesData<Task[]>({ queryKey: TASKS_KEY })
        //cambia la foto, llamando a applyMove
        queryClient.setQueriesData<Task[]>(
            { queryKey: TASKS_KEY },
            (tasks) => tasks && applyMove(tasks, id, move),
        )
        mutation.mutate({ id, move, previous })
    }

    return { ...mutation, mutate }
}

// Un índice fraccionario deja la tarjeta justo en su nueva posición sin
// recalcular el resto. Funciona también en las listas filtradas por prioridad.
export function applyMove(tasks: Task[], id: string, { status, newOrderIndex }: MoveTaskInput): Task[] {
    const moved = tasks.find((t) => t.id === id)
    if (!moved) return tasks

    const movingDown = moved.status === status && newOrderIndex > moved.orderIndex
    const orderIndex = newOrderIndex + (movingDown ? 0.5 : -0.5)

    return tasks
        .map((t) => (t.id === id ? { ...t, status, orderIndex } : t))
        .sort((a, b) => a.orderIndex - b.orderIndex)
}

