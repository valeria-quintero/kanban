import { useState, type ChangeEvent } from 'react';
import { PRIORITIES, PRIORITY_KEYS } from '../constants/priorities';
import { PriorityBadge } from './PriorityBadge';
import { STATUS_KEYS, STATUSES, type TaskStatus } from '../constants/status';
import type { CreateTaskInput, Task } from '../types/task';
import { useCreateTask, useUpdateTask } from '../tasks/use-task-mutations';

type NewTaskProps = {
  onClose: () => void
  // Si se pasa una tarea, el formulario la edita en lugar de crear una nueva
  task?: Task
}

export default function NewTask({ onClose, task }: NewTaskProps) {

  const isEditing = !!task

  const [form, setForm] = useState<CreateTaskInput>({
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? 'BACKLOG',
    priority: task?.priority ?? 'MEDIUM'
  })

  const [titleError, setTitleError] = useState<string | null>(null)

  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const mutation = isEditing ? updateTask : createTask

  const handlerOnChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, title:e.target.value })
    if (titleError) setTitleError(null)
  }

  const validateTitle = (title: string): string | null => {
    const value = title.trim()
    if (!value) return 'El título es obligatorio'
    if (value.length < 3) return 'El título debe tener al menos 3 caracteres'
    return null
  }

  const handlerOnChangeDescription = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setForm({ ...form, description:e.target.value })
  }

  const handlerOnChangeState = (e: ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, status:e.target.value as TaskStatus})
  }

  const handlerSubmitForm = () => {
    const error = validateTitle(form.title)
    if (error) {
      setTitleError(error)
      return
    }

    if (task) {
      // El estado no se edita aquí: cambia al mover la tarjeta
      const { title, description, priority } = form
      updateTask.mutate({ id: task.id, input: { title, description, priority } }, { onSuccess: onClose })
    } else {
      createTask.mutate(form, { onSuccess: onClose })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden font-sans">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012-2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{isEditing ? 'Editar tarea' : 'Nueva tarea'}</h2>
              <p className="text-xs text-slate-500">
                {isEditing ? 'Modifica los datos de la tarea' : 'Completa los datos para añadirla al tablero'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cuerpo del formulario */}
        <div className="p-6 space-y-5">
          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Título <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder="Ej. Revisar contrato con proveedor" 
              className={`w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white border rounded-lg focus:outline-none focus:ring-1 ${
                titleError
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500'
              }`}
              value={form.title}
              onChange={handlerOnChangeTitle}
              aria-invalid={!!titleError}
              aria-describedby={titleError ? 'title-error' : undefined}
            />
            {titleError && (
              <p id="title-error" className="mt-1.5 text-xs text-red-600">{titleError}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Descripción
            </label>
            <textarea 
              rows={4}
              placeholder="Contexto, criterios de aceptación o enlaces relevantes"
              className="w-full px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              value={form.description}
              onChange={handlerOnChangeDescription}
            ></textarea>
          </div>

          {/* Estado (solo al crear: después cambia arrastrando la tarjeta) */}
          {!isEditing && <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Estado <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10" value={form.status} onChange={handlerOnChangeState}>
                {STATUS_KEYS.map((item) => {
                  return (
                    <option value={item} key={item} >
                      {STATUSES[item].label}
                    </option>
                  )
                })}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>}

          {/* Prioridad */}
          <fieldset>
            <legend className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Prioridad <span className="text-red-500">*</span>
            </legend>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITY_KEYS.map((item) => {
                const isSelected = form.priority === item 
                return ( 
                  <button
                    key={item}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setForm({ ...form, priority: item })}
                    className={`w-full rounded-full hover:cursor-pointer ${isSelected ? 'ring-blue-600' : 'opacity-60'}`}
                  >
                    <PriorityBadge priority={PRIORITIES[item]} />
                  </button>
                )
              })}
            </div>


          </fieldset>
        </div>

        {/* Pie de página */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
          {mutation.isError
            ? <span role="alert" className="text-xs text-red-600">No se pudo guardar la tarea. Inténtalo de nuevo.</span>
            : <span className="text-xs text-slate-400">Se guarda en el servidor al confirmar</span>}
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
              Cancelar
            </button>
            <button type="button" disabled={mutation.isPending} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60" onClick={handlerSubmitForm}>
              {mutation.isPending ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear tarea'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}