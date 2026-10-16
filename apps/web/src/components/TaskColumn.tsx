import { STATUSES, type TaskStatus } from '../constants/status';
import { useTaskStore } from '../tasks/use-task-storage';
import type { Task } from '../types/task';
import TaskCard from './TaskCard'; // Asegúrate de importar tu componente TaskCard

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  status: TaskStatus
}

export default function TaskColumn({ title, tasks, status }: TaskColumnProps) {

  const priority = useTaskStore((s) => s.priority)

  return (
    <div className="bg-[#f8fafc] rounded-3xl p-5 flex flex-col gap-4 border border-slate-100 shadow-sm">
      {/* Cabecera de la columna */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          {/* Indicador de punto azul */}
          <span className={`w-2.5 h-2.5 rounded-full ${STATUSES[status].dot}`}></span>
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-xs">
            {title}
          </h3>
          {/* Contador dinámico basado en la longitud del arreglo */}
          <span className="bg-slate-200/70 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>

        {/* Botón de añadir */}
        <button 
          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          aria-label="Añadir tarea"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* Contenedor de las tarjetas mapeando el arreglo de tareas */}
      <div className="flex flex-col gap-3.5">
        {tasks.filter(task => {
          if (priority === 'All' || !priority) {
            return true
          }

          return task.priority === priority
        }).map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}