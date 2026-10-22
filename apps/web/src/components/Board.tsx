import { useState } from "react";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { STATUS_KEYS, STATUSES, type TaskStatus } from "../constants/status";
import type { Task } from "../types/task";
import { useTask } from "../tasks/use-task";
import { applyMove, useMoveTask } from "../tasks/use-task-mutations";
import { useTaskStore } from "../tasks/use-task-storage";
import TaskColumn from "./TaskColumn";

type BoardProps = {
    onEditTask: (task: Task) => void
    onAddTask: (status: TaskStatus) => void
}

// destination.index cuenta solo las tarjetas visibles (con filtros activos), pero la API necesita la posición dentro de la columna completa.
function toColumnIndex(visible: Task[], column: Task[], index: number): number {
    const positionOf = (task: Task) => column.findIndex((t) => t.id === task.id)

    if (index < visible.length) return positionOf(visible[index])
    if (visible.length === 0) return column.length
    return positionOf(visible[visible.length - 1]) + 1
}

export default function Board({ onEditTask, onAddTask }: BoardProps) {

    // Además de las tareas, se leen los estados de carga y error que ya devuelve useQuery
    const { tasks: serverTasks, isLoading, isError, refetch } = useTask()

    // Tablero sin filtrar por prioridad, para calcular los índices reales
    const { tasks: allTasks } = useTask('All')
    const searchTerm = useTaskStore((s) => s.searchTerm)
    const { mutate: moveTask } = useMoveTask()

    // Copia local de las tareas. 
    // TanStack avisa de los cambios de caché un instante después (setTimeout), y dnd pinta justo al soltar: sin esta copia se ve la tarjeta volver a su sitio anterior antes de saltar al nuevo.
    const [tasks, setTasks] = useState(serverTasks)
    const [prevServerTasks, setPrevServerTasks] = useState(serverTasks)
    // Cuando llegan datos nuevos de la caché (optimista, refetch o rollback), reemplazan a la copia local
    if (serverTasks !== prevServerTasks) {
        setPrevServerTasks(serverTasks)
        setTasks(serverTasks)
    }

    const filteredTasks = tasks.filter((t) => {
        const title = t.title.toLowerCase()
        const description = (t.description ?? "").toLowerCase()

        return (
            title.includes(searchTerm.toLowerCase().trim()) || description.includes(searchTerm.toLowerCase().trim() )
        )
    })

    const handleDragEnd = ({ draggableId, source, destination }: DropResult) => {
        //se suelta fuera de cualquier columna
        if (!destination) return
        //se suelta donde estaba
        if (destination.droppableId === source.droppableId && destination.index === source.index) return

        //el id de cada columna es su estado
        const status = destination.droppableId as TaskStatus

        //tarjetas que se ven, con filtros, de la columna destino
        const visible = filteredTasks.filter((t) => t.status === status && t.id !== draggableId)

        //tarjetas de la columna
        const column = allTasks.filter((t) => t.status === status && t.id !== draggableId)
        const index = toColumnIndex(visible, column, destination.index)
        const move = { status, newOrderIndex: index >= 0 ? index : destination.index }

        //se pinta ya, en el mismo render en que dnd suelta la tarjeta
        setTasks((current) => applyMove(current, draggableId, move))
        moveTask({ id: draggableId, move })
    }

    // Estado de carga: se muestra un mensaje en lugar del tablero vacío
    if (isLoading) {
        return <p className="px-6 py-5 text-center">Cargando tareas...</p>
    }

    // Estado de error: se avisa al usuario y se ofrece reintentar
    if (isError) {
        return (
            <div className="px-6 py-5 text-center">
                <p>No se pudieron cargar las tareas.</p>
                {/* Vuelve a lanzar la petición al servidor */}
                <button type="button" className="mt-2 underline" onClick={() => refetch()}>Reintentar</button>
            </div>
        )
    }

    return(
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid gap-5 px-6 py-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                {STATUS_KEYS.map((status) => (
                    <TaskColumn key={status} title={STATUSES[status].label} tasks={filteredTasks.filter((t) => t.status === status)} status={status} onEditTask={onEditTask} onAddTask={onAddTask}/>
                ))}
            </div>
        </DragDropContext>
    )
}
