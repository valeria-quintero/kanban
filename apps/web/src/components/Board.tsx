import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { STATUS_KEYS, STATUSES, type TaskStatus } from "../constants/status";
import type { Task } from "../types/task";
import { useTask } from "../tasks/use-task";
import { useMoveTask } from "../tasks/use-task-mutations";
import { useTaskStore } from "../tasks/use-task-storage";
import TaskColumn from "./TaskColumn";

type BoardProps = {
    onEditTask: (task: Task) => void
    onAddTask: (status: TaskStatus) => void
}

// destination.index cuenta solo las tarjetas visibles (con filtros activos),
// pero la API necesita la posición dentro de la columna completa.
function toColumnIndex(visible: Task[], column: Task[], index: number): number {
    const positionOf = (task: Task) => column.findIndex((t) => t.id === task.id)

    if (index < visible.length) return positionOf(visible[index])
    if (visible.length === 0) return column.length
    return positionOf(visible[visible.length - 1]) + 1
}

export default function Board({ onEditTask, onAddTask }: BoardProps) {

    const { tasks } = useTask()
    // Tablero sin filtrar por prioridad, para calcular los índices reales
    const { tasks: allTasks } = useTask('All')
    const searchTerm = useTaskStore((s) => s.searchTerm)
    const { mutate: moveTask } = useMoveTask()
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
        const newOrderIndex = toColumnIndex(visible, column, destination.index)

        moveTask({
            id: draggableId,
            move: { status, newOrderIndex: newOrderIndex >= 0 ? newOrderIndex : destination.index },
        })
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
