import { useTask } from "../tasks/use-task";

export default function Header() {
    const { tasks } = useTask()
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === 'DONE').length

    return (
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-slate-900">Tablero de tareas</h1>
                    <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-full">
                        <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
                        Todo guardado
                    </span>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">
                    {totalTasks} tareas · {completedTasks} completadas
                </p>
            </div>

            <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Nueva tarea
            </button>
        </header>
    )
}