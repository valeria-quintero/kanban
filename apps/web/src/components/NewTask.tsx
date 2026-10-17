import { useState } from 'react';
import { PRIORITIES, PRIORITY_KEYS } from '../constants/priorities';
import { PriorityBadge } from './PriorityBadge';
import { STATUS_KEYS, STATUSES, type TaskStatus } from '../constants/status';
import type { CreateTaskInput } from '../types/task';

export default function NewTask() {
  
  const [form, setForm] = useState<CreateTaskInput>({
    title: '',
    description: '',
    status: 'BACKLOG',
    priority: 'MEDIUM'
  })

  const [titleError, setTitleError] = useState<string | null>(null)

  const handlerOnChangeTitle = (e) => {
    setForm({ ...form, title:e.target.value })
    if (titleError) setTitleError(null)
  }

  const validateTitle = (title: string): string | null => {
    const value = title.trim()
    if (!value) return 'El título es obligatorio'
    if (value.length < 3) return 'El título debe tener al menos 3 caracteres'
    return null
  }

  const handlerOnChangeDescription = (e) => {
    setForm({ ...form, description:e.target.value })
  }

  const handlerOnChangeState = (e) => {
    setForm({ ...form, status:e.target.value as TaskStatus})
  }

  const handlerSubmitForm = () => {
    const error = validateTitle(form.title)
    if (error) {
      setTitleError(error)
      return
    }
    console.log(form)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900/50 p-4">
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
              <h2 className="text-lg font-bold text-slate-800">Nueva tarea</h2>
              <p className="text-xs text-slate-500">Completa los datos para añadirla al tablero</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
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
              onChange={handlerOnChangeDescription}
            ></textarea>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Estado <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white border border-slate-200 rounded-lg appearance-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-10" onChange={handlerOnChangeState}>
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
          </div>

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
          <span className="text-xs text-slate-400">Se muestra al instante y se confirma con el servidor</span>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
              Cancelar
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm" onClick={handlerSubmitForm}>
              Crear tarea
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}