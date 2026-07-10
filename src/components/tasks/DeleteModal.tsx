'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Task } from '@/types';

interface Props {
  task: Task;
  onSuccess: (taskId: number) => void;
  onClose: () => void;
}

export default function DeleteModal({ task, onSuccess, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/tasks/${task.id}/`);
      toast.success('Task deleted');
      onSuccess(task.id);
    } catch {
      toast.error('Failed to delete task. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <h2 className="text-base font-semibold text-zinc-100">Delete Task</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Are you sure you want to delete{' '}
          <span className="font-medium text-zinc-200">&ldquo;{task.title}&rdquo;</span>?
          This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
