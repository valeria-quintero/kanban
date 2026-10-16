import { useState } from "react";
import { PRIORITIES, type Priority, PRIORITY_KEYS } from "../constants/priorities";
import { PriorityBadge } from "./PriorityBadge";

export function FilterBar() {

    const [priority, setPriority] = useState<Priority>()

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-50/50">
      {/* Input de búsqueda */}
      <div className="relative w-80">
        <svg 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por título o descripción"
          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 outline-none"
        />
      </div>

      {/* Filtros de prioridad */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500 font-medium mr-1">Prioridad</span>

        {PRIORITY_KEYS.map((item) => {
            const isSelected = item === priority
            return (
                <button
                    key={item}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setPriority(item)}
                    className={`w-full rounded-full hover:cursor-pointer ${isSelected ? 'ring-blue-600' : 'opacity-60'}`}>

                <PriorityBadge key={item} priority={PRIORITIES[item]} />
                </button>
            )
        })}
      </div>
    </div>
  );
} 