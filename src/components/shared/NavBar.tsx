'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    toast.dismiss();
    router.replace('/login');
  };

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
        pathname === href
          ? 'bg-zinc-800 text-white'
          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/tasks" className="text-lg font-bold text-white">
          Task<span className="text-indigo-400">Lens</span>
        </Link>

        <div className="flex items-center gap-1">
          {navLink('/tasks', 'Tasks')}
          {navLink('/annotate', 'Annotate')}
        </div>

        <button
          onClick={handleLogout}
          className="text-sm text-zinc-400 hover:text-zinc-100 transition"
        >
          Log out
        </button>
      </div>
    </nav>
  );
}
