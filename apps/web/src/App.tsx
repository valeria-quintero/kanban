import { useState } from 'react'
import './App.css'
import Board from './components/Board'
import Header from './components/Header'
import NewTask from './components/NewTask'
import { FilterBar } from './components/TaskFilters'
import type { Task } from './types/task'

function App() {
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  return (
    <div>
      <Header onNewTask={() => setIsNewTaskOpen(true)} />
      <FilterBar />
      <Board onEditTask={setEditingTask} />
      {isNewTaskOpen && <NewTask onClose={() => setIsNewTaskOpen(false)} />}
      {editingTask && <NewTask key={editingTask.id} task={editingTask} onClose={() => setEditingTask(null)} />}
    </div>
  )
}

export default App
