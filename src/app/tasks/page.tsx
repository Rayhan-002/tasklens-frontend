'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function TasksPage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950">
      <p className="text-zinc-400">Kanban Board — coming in Milestone 3</p>
      <button
        onClick={handleLogout}
        className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition"
      >
        Log out
      </button>
    </main>
  );
}
