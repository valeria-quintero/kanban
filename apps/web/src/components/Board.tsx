import { STATUS_KEYS, STATUSES } from "../constants/status";
import { useTask } from "../tasks/use-task";
import TaskColumn from "./TaskColumn";

export default function Board() {

    const { tasks } = useTask()

    return(
        <div className="grid grid-cols-4 gap-5 px-6 py-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            {STATUS_KEYS.map((status) => (
                <TaskColumn key={status} title={STATUSES[status].label} tasks={tasks.filter((t) => t.status === status)} status={status}/>
            ))}
        </div>
    )
}