import { PRIORITIES } from "../constants/priorities";
import { useDeleteTask } from "../tasks/use-task-mutations";
import type { Task } from "../types/task";
import { PriorityBadge } from "./PriorityBadge";

//const task = mockTasks[3]

interface Props {
  task: Task
  onEdit: (task: Task) => void
}

export default function TaskCard({ task, onEdit }: Props) {

  const { mutate: deleteTask, isPending } = useDeleteTask()

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-md">
      <div className="flex items-center justify-between mb-4">
        {/* Badge de Prioridad */}
        <PriorityBadge priority={PRIORITIES[task.priority]} />

        {/* Iconos de acción */}
        <div className="flex items-center gap-4 text-gray-400">
          <button type="button" onClick={() => onEdit(task)} className="hover:text-gray-600 transition-colors" aria-label={`Editar tarea: ${task.title}`}>
            {/* Icono de editar */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.862 4.487Zm0 0L19.5 7.125" />
            </svg>
          </button>
          <button type="button" onClick={() => {
            if (confirm(`¿Eliminar "${task.title}"?`)) deleteTask(task.id)
            }} disabled={isPending} className="hover:text-red-500 transition-colors" aria-label={`Eliminar tarea: ${task.title}`}>
            {/* Icono de eliminar */}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      {/* Título */}
      <h2 className="text-xl font-bold text-slate-900 mb-3">
        {task.title}
      </h2>

      {/* Descripción */}
      <p className="text-slate-600 text-sm leading-relaxed">
        {task.description}
      </p>
    </div>
  );
}