import { useState } from 'react'
import './App.css'
import Board from './components/Board'
import Header from './components/Header'
import NewTask from './components/NewTask'
import { FilterBar } from './components/TaskFilters'
import type { Task } from './types/task'
import type { TaskStatus } from '@kanban/shared'

function App() {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  // null = modal de creación cerrado; si no, es el estado con el que se abre el formulario
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus | null>(null)

  return (
    <div>
      <Header onNewTask={() => setNewTaskStatus('BACKLOG')} />
      <FilterBar />
      <Board onEditTask={setEditingTask} onAddTask={setNewTaskStatus} />
      {newTaskStatus && (
        <NewTask key={newTaskStatus} initialStatus={newTaskStatus} onClose={() => setNewTaskStatus(null)} />
      )}
      {editingTask && <NewTask key={editingTask.id} task={editingTask} onClose={() => setEditingTask(null)} />}
    </div>
  )
}

export default App
