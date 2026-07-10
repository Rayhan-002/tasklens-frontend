import { Task } from '@/types';

const PRIORITY_STYLES: Record<Task['priority'], string> = {
  low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
  medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
  high: 'bg-red-500/10 text-red-400 border border-red-500/25',
};

interface Props {
  task: Task;
}

export default function TaskCard({ task }: Props) {
  return (
    <div className="group cursor-pointer rounded-lg border border-zinc-700/50 bg-zinc-800/60 p-3 transition hover:border-zinc-600 hover:bg-zinc-800">
      <p className="text-sm font-medium leading-snug text-zinc-100">{task.title}</p>

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
