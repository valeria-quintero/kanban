import { useState } from 'react'
import './App.css'
import Board from './components/Board'
import Header from './components/Header'
import NewTask from './components/NewTask'
import { FilterBar } from './components/TaskFilters'

function App() {
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)

  return (
    <div>
      {/* <TaskColumn title='Por hacer' tasks={mockTasks.filter((tarea) => tarea.status === 'BACKLOG')} status='BACKLOG' /> */}
      <Header onNewTask={() => setIsNewTaskOpen(true)} />
      <FilterBar />
      <Board />
      {isNewTaskOpen && <NewTask onClose={() => setIsNewTaskOpen(false)} />}
    </div>
  )
}

export default App