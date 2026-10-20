import type { Priority } from '@kanban/shared'

export type { Priority }

export const PRIORITIES = {
  LOW:    { label: 'Baja',    color: 'bg-green-600'  },
  MEDIUM: { label: 'Media',   color: 'bg-blue-500'   },
  HIGH:   { label: 'Alta',    color: 'bg-orange-500'  },
  URGENT: { label: 'Urgente', color: 'bg-red-600'    },
} as const satisfies Record<Priority, { label: string; color: string }>

export const PRIORITY_KEYS = Object.keys(PRIORITIES) as Priority[]; //as -> parse()

// 'All' solo existe en la UI: para la API equivale a no enviar el filtro
export type PriorityFilter = Priority | 'All'
