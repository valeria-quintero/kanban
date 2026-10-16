import { useTask } from "../tasks/use-task";

export default function Header() {
    const { tasks } = useTask()
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length

    return (
        <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <h1>Tablero de tareas</h1>
                <h2>Todo guardado</h2>
            </div>
        </header>
    )
}