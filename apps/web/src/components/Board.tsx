import { STATUS_KEYS, STATUSES } from "../constants/status";
import { useTask } from "../tasks/use-task";
import { useTaskStore } from "../tasks/use-task-storage";
import TaskColumn from "./TaskColumn";

export default function Board() {

    const { tasks } = useTask()
    const searchTerm = useTaskStore((s) => s.searchTerm)
    
    const filteredTasks = tasks.filter((t) => {
        const title = t.title.toLowerCase()
        const description = (t.description ?? "").toLowerCase()

        return (
            title.includes(searchTerm.toLowerCase().trim()) || description.includes(searchTerm.toLowerCase().trim() )
        )
    }) 

    return(
        <div className="grid gap-5 px-6 py-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            {STATUS_KEYS.map((status) => (
                <TaskColumn key={status} title={STATUSES[status].label} tasks={filteredTasks.filter((t) => t.status === status)} status={status}/>
            ))}
        </div>
    )
}