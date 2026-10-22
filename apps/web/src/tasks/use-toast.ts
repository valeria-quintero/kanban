import { create } from "zustand";

export type ToastKind = 'success' | 'error'

export interface Toast {
    id: number
    kind: ToastKind
    message: string
}

interface ToastState {
    toasts: Toast[],
    show: (message: string, kind?: ToastKind) => void,
    dismiss: (id: number) => void
}

export const TOAST_DURATION_MS = 3000
let nextId = 0

export const useToastStore = create<ToastState>() ((set, get) => ({
    toasts: [],
    show: (message, kind = 'success') => {
        const id = nextId++
        set((state) => ({ toasts: [...state.toasts, { id, kind, message }] }))
        setTimeout(() => get().dismiss(id), TOAST_DURATION_MS)
    },
    dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
}))

// Para disparar un toast fuera de componentes (p. ej. en los hooks de mutación)
export const toast = {
    success: (message: string) => useToastStore.getState().show(message, 'success'),
    error: (message: string) => useToastStore.getState().show(message, 'error'),
}
