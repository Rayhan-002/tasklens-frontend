import { useDroppable } from '@dnd-kit/core';
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
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export default function Column({ status, label, tasks, onAddTask, onEditTask, onDeleteTask }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status}`,
    data: { type: 'column', status },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[420px] flex-col rounded-xl border p-4 transition-colors ${
        isOver
          ? 'border-indigo-500/60 bg-indigo-500/5'
          : 'border-zinc-800 bg-zinc-900/60'
      }`}
    >
      {/* Column header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${DOT[status]}`} />
          <h2 className={`text-sm font-semibold ${ACCENT[status]}`}>{label}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
            {tasks.length}
          </span>
          <button
            onClick={onAddTask}
            className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-700 hover:text-zinc-100"
            aria-label="Add task"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex flex-1 flex-col gap-2">
        {tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs text-zinc-600">No tasks for this day</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task)}
            />
          ))
        )}
      </div>
    </div>
  );
}
