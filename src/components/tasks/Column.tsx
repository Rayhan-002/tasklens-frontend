import { Task, TaskStatus } from '@/types';
import TaskCard from './TaskCard';

const ACCENT: Record<TaskStatus, string> = {
  todo: 'text-zinc-400',
  in_progress: 'text-amber-400',
  done: 'text-emerald-400',
};

const DOT: Record<TaskStatus, string> = {
  todo: 'bg-zinc-500',
  in_progress: 'bg-amber-400',
  done: 'bg-emerald-400',
};

interface Props {
  status: TaskStatus;
  label: string;
  tasks: Task[];
}

export default function Column({ status, label, tasks }: Props) {
  return (
    <div className="flex min-h-[420px] flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      {/* Column header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${DOT[status]}`} />
          <h2 className={`text-sm font-semibold ${ACCENT[status]}`}>{label}</h2>
        </div>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div className="flex flex-1 flex-col gap-2">
        {tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs text-zinc-600">No tasks for this day</p>
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
