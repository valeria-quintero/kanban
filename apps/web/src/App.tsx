import './App.css'
import Board from './components/Board'
import TaskColumn from './components/TaskColumn'
import { mockTasks } from './tasks/tasks.mock'

function App() {

  return (
    <div>
      {/* <TaskColumn title='Por hacer' tasks={mockTasks.filter((tarea) => tarea.status === 'BACKLOG')} status='BACKLOG' /> */}
      <Board tasks={mockTasks} />
    </div>
  )
}

export default App