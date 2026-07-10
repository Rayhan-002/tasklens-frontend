'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Task, Tag, TaskStatus } from '@/types';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().default(''),
  status: z.enum(['todo', 'in_progress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  due_date: z.string().min(1, 'Due date is required'),
  tag_ids: z.array(z.number()).default([]),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface Props {
  mode: 'create' | 'edit';
  task?: Task;
  defaultStatus?: TaskStatus;
  defaultDate: string;
  availableTags: Tag[];
  onSuccess: (task: Task) => void;
  onClose: () => void;
}

export default function TaskModal({
  mode,
  task,
  defaultStatus = 'todo',
  defaultDate,
  availableTags,
  onSuccess,
  onClose,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? defaultStatus,
      priority: task?.priority ?? 'medium',
      due_date: task?.due_date ?? defaultDate,
      tag_ids: task?.tags.map((t) => t.id) ?? [],
    },
  });

  const selectedTagIds = watch('tag_ids') ?? [];

  const toggleTag = (id: number) => {
    setValue(
      'tag_ids',
      selectedTagIds.includes(id)
        ? selectedTagIds.filter((t) => t !== id)
        : [...selectedTagIds, id],
    );
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      const res =
        mode === 'create'
          ? await api.post<Task>('/tasks/', data)
          : await api.patch<Task>(`/tasks/${task!.id}/`, data);
      toast.success(mode === 'create' ? 'Task created' : 'Task updated');
      onSuccess(res.data);
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const input =
    'w-full rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-100">
            {mode === 'create' ? 'New Task' : 'Edit Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 transition hover:text-zinc-300"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Title *</label>
            <input {...register('title')} placeholder="Task title" className={input} />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Description</label>
            <textarea
              {...register('description')}
              rows={2}
              placeholder="Optional description"
              className={`${input} resize-none`}
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Status</label>
              <select {...register('status')} className={input}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Priority</label>
              <select {...register('priority')} className={input}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Due Date *</label>
            <input
              type="date"
              {...register('due_date')}
              className={`${input} [color-scheme:dark]`}
            />
            {errors.due_date && (
              <p className="mt-1 text-xs text-red-400">{errors.due_date.message}</p>
            )}
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const active = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className="rounded-md px-2 py-1 text-xs font-medium transition"
                      style={{
                        backgroundColor: active ? `${tag.color}33` : 'transparent',
                        color: active ? tag.color : '#71717a',
                        border: `1px solid ${active ? tag.color + '66' : '#3f3f46'}`,
                      }}
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Saving…' : mode === 'create' ? 'Create Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
