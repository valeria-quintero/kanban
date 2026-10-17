import { create } from "zustand";
import type { Priority } from "../constants/priorities";

interface TaskState {
    priority: Priority | 'All',
    priorityChange: (prty: Priority | 'All') => void,

    searchTerm: string,
    setSearchTerm: (term: string) => void
}

export const useTaskStore = create<TaskState>() ((set) => ({
    priority: 'All',
    priorityChange: (prty: Priority | 'All') => set(() => ({ priority: prty })),

    searchTerm: '',
    setSearchTerm: (term: string) => set(() => ({searchTerm: term}))
}))