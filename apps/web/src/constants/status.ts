export const STATUSES = {
    BACKLOG:     { label: 'Por hacer',   dot: 'bg-sky-600'},
    IN_PROGRESS: { label: 'En progreso', dot: 'bg-yellow-400'},
    REVIEW:      { label: 'En revisión', dot: 'bg-rose-400'},
    DONE:        { label: 'Completado',  dot: 'bg-teal-400'}
} as const

export type TaskStatus = keyof typeof STATUSES

export const STATUS_KEYS = Object.keys(STATUSES) as TaskStatus[];