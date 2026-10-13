export const PRIORITIES = {
  LOW:    { label: 'Baja',    color: 'bg-green-600'  },
  MEDIUM: { label: 'Media',   color: 'bg-yellow-500'   },
  HIGH:   { label: 'Alta',    color: 'bg-orange-500'  },
  URGENT: { label: 'Urgente', color: 'bg-red-600'    },
} as const

export type Priority = keyof typeof PRIORITIES