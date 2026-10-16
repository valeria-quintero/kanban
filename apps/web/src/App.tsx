import './App.css'
import Board from './components/Board'
import Header from './components/Header'
import { FilterBar } from './components/TaskFilters'

function App() {

  return (
    <div>
      {/* <TaskColumn title='Por hacer' tasks={mockTasks.filter((tarea) => tarea.status === 'BACKLOG')} status='BACKLOG' /> */}
      <Header />
      <FilterBar />
      <Board />
    </div>
  )
}

export default App