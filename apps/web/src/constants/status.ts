export const STATUSES = {
    BACKLOG: { label: 'Por hacer' },
    IN_PROGRESS: { label: 'En proceso'},
    REVIEW: { label: 'En revisión' },
    DONE: { label: 'Hecho' }
} as const

export type TaskStatus = keyof typeof STATUSES

export const STATUS_KEYS = Object.keys(STATUSES) as TaskStatus[];