import { create } from "zustand";
import type { PriorityFilter } from "../constants/priorities";

interface TaskState {
    priority: PriorityFilter,
    priorityChange: (prty: PriorityFilter) => void,

    searchTerm: string,
    setSearchTerm: (term: string) => void
}

export const useTaskStore = create<TaskState>() ((set) => ({
    priority: 'All',
    priorityChange: (prty: PriorityFilter) => set(() => ({ priority: prty })),

    searchTerm: '',
    setSearchTerm: (term: string) => set(() => ({searchTerm: term}))
}))