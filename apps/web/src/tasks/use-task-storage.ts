import { create } from "zustand";
import type { Priority } from "../constants/priorities";

interface TaskState {
    priority: Priority | 'All',
    priorityChange: (prio: Priority | 'All') => void
}

export const useTaskStore = create<TaskState>() ((set) => ({
    priority: 'All',
    priorityChange: (prio: Priority | 'All') => set((state) => ({ priority: prio }))
}))