export const STATUSES = {
    BACKLOG: { label: 'Por hacer' },
    IN_PROGRESS: { label: 'En proceso'},
    REVIEW: { label: 'En revisión' },
    DONE: { label: 'Hecho' }
} as const

export type Status = keyof typeof STATUSES