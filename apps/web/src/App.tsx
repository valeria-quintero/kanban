import './App.css'
import NewTask from './components/NewTask'
import { PriorityBadge } from './components/PriorityBadge'
import { PRIORITIES } from './constants/priorities'

function App() {
  return (
    <div>
      <NewTask />
    </div>
  )
}

export default App