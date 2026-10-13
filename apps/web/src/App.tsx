import './App.css'
import { PriorityBadge } from './components/PriorityBadge'

function App() {
  return (
    <div className="p-6">
      <PriorityBadge priority="LOW" />
      <PriorityBadge priority="MEDIUM" />
      <PriorityBadge priority="HIGH" />
      <PriorityBadge priority="URGENT" />
    </div>
  )
}

export default App