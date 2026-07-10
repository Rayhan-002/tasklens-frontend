import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';

const PRIORITY_STYLES: Record<Task['priority'], string> = {
  low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
  medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
  high: 'bg-red-500/10 text-red-400 border border-red-500/25',
};

interface Props {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskCard({ task, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { type: 'task', taskId: task.id, status: task.status },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 }}
      className="group rounded-lg border border-zinc-700/50 bg-zinc-800/60 p-3 transition hover:border-zinc-600 hover:bg-zinc-800 cursor-grab active:cursor-grabbing"
    >

      {/* Title row — buttons sit in the flow, pushing title left */}
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-zinc-100">
          {task.title}
        </p>

        {/* Edit / Delete — hidden until hover, shrink-0 so they never compress the title */}
        <div className="hidden shrink-0 gap-1 group-hover:flex" onPointerDown={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="rounded p-1 text-zinc-500 transition hover:bg-zinc-700 hover:text-zinc-200"
            aria-label="Edit task"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="rounded p-1 text-zinc-500 transition hover:bg-red-500/20 hover:text-red-400"
            aria-label="Delete task"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{task.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium capitalize ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>

        {task.tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${tag.color}22`,
              color: tag.color,
              border: `1px solid ${tag.color}44`,
            }}
          >
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  );
}
