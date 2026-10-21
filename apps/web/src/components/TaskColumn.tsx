import { Draggable, Droppable } from '@hello-pangea/dnd';
import { STATUSES, type TaskStatus } from '../constants/status';
import type { Task } from '../types/task';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  status: TaskStatus
  onEditTask: (task: Task) => void
  onAddTask: (status: TaskStatus) => void
}

export default function TaskColumn({ title, tasks, status, onEditTask, onAddTask }: TaskColumnProps) {

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
          type="button"
          onClick={() => onAddTask(status)}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          aria-label={`Añadir tarea en ${title}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* Contenedor de las tarjetas mapeando el arreglo de tareas */}
      {/* Sin gap: el espaciado va en cada tarjeta para que dnd calcule bien las posiciones */}
      <Droppable droppableId={status}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col min-h-24">
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="pb-3.5">
                    <TaskCard task={task} onEdit={onEditTask} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}