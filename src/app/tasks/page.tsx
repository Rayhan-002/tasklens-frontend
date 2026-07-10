'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import NavBar from '@/components/shared/NavBar';
import DateSelector from '@/components/shared/DateSelector';
import Board from '@/components/tasks/Board';

export default function TasksPage() {
  const router = useRouter();
  const { isAuthenticated, hydrated, hydrate } = useAuthStore();

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.replace('/login');
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-zinc-950">
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-zinc-100">Task Board</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Select a day to view and manage tasks</p>
        </div>
        <DateSelector />
        <div className="mt-6">
          <Board />
        </div>
      </main>
    </div>
  );
}
