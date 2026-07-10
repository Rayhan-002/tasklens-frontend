'use client';

import { useEffect, useState, useCallback } from 'react';
import { DndContext, PointerSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { toast } from 'sonner';
import { useDateStore } from '@/store/dateStore';
import { Task, Tag, TaskStatus } from '@/types';
import api from '@/lib/api';
import Column from './Column';
import TaskModal from './TaskModal';
import DeleteModal from './DeleteModal';

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'todo', label: 'To Do' },
  { status: 'in_progress', label: 'In Progress' },
  { status: 'done', label: 'Done' },
];

type ModalState =
  | { type: 'create'; status: TaskStatus }
  | { type: 'edit'; task: Task }
  | { type: 'delete'; task: Task }
  | null;

export default function Board() {
  const { selectedDate } = useDateStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);

  const fetchTasks = useCallback(() => {
    setLoading(true);
    api
      .get<Task[]>('/tasks/', { params: { date: selectedDate } })
      .then((res) => setTasks(res.data))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  useEffect(() => {
    api.get<Tag[]>('/tasks/tags/').then((res) => setTags(res.data)).catch(() => {});
  }, []);

  const handleTaskSaved = (saved: Task) => {
    setTasks((prev) => {
      const exists = prev.find((t) => t.id === saved.id);
      // Keep in view only if due_date matches selected day
      if (saved.due_date !== selectedDate) {
        return exists ? prev.filter((t) => t.id !== saved.id) : prev;
      }
      return exists ? prev.map((t) => (t.id === saved.id ? saved : t)) : [saved, ...prev];
    });
    setModal(null);
  };

  const handleTaskDeleted = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setModal(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const taskId = active.data.current?.taskId as number | undefined;
    const fromStatus = active.data.current?.status as TaskStatus | undefined;
    const toStatus = over.data.current?.status as TaskStatus | undefined;
    if (!taskId || !fromStatus || !toStatus || fromStatus === toStatus) return;

    let snapshot: Task[] = [];
    setTasks((prev) => {
      snapshot = prev;
      return prev.map((t) => (t.id === taskId ? { ...t, status: toStatus } : t));
    });

    try {
      await api.patch(`/tasks/${taskId}/`, { status: toStatus });
    } catch {
      setTasks(snapshot);
      toast.error('Could not move task. Please try again.');
    }
  };

  const byStatus = (s: TaskStatus) => tasks.filter((t) => t.status === s);

  return (
    <>
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {COLUMNS.map((col) => (
              <Column
                key={col.status}
                status={col.status}
                label={col.label}
                tasks={byStatus(col.status)}
                onAddTask={() => setModal({ type: 'create', status: col.status })}
                onEditTask={(task) => setModal({ type: 'edit', task })}
                onDeleteTask={(task) => setModal({ type: 'delete', task })}
              />
            ))}
          </div>
        </DndContext>
      )}

      {/* Task create / edit modal */}
      {(modal?.type === 'create' || modal?.type === 'edit') && (
        <TaskModal
          mode={modal.type}
          task={modal.type === 'edit' ? modal.task : undefined}
          defaultStatus={modal.type === 'create' ? modal.status : undefined}
          defaultDate={selectedDate}
          availableTags={tags}
          onSuccess={handleTaskSaved}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete confirmation modal */}
      {modal?.type === 'delete' && (
        <DeleteModal
          task={modal.task}
          onSuccess={handleTaskDeleted}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
