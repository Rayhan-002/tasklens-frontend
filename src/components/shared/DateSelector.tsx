'use client';

import { useState } from 'react';
import { useDateStore } from '@/store/dateStore';

function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function DateSelector() {
  const { selectedDate, setSelectedDate } = useDateStore();
  const [offset, setOffset] = useState(0); // days offset from today for window center

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toLocalISO(today);

  const center = addDays(today, offset);
  const days = Array.from({ length: 7 }, (_, i) => addDays(center, i - 3));

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-4">
      {/* Month / year + navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOffset((o) => o - 7)}
          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          aria-label="Previous week"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <span className="w-40 text-center text-sm font-medium text-zinc-300">
          {MONTH_NAMES[center.getMonth()]} {center.getFullYear()}
        </span>

        <button
          onClick={() => setOffset((o) => o + 7)}
          className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          aria-label="Next week"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>

        <button
          onClick={() => { setOffset(0); setSelectedDate(todayISO); }}
          className="rounded-md px-2 py-1 text-xs font-medium text-indigo-400 transition hover:bg-zinc-800 hover:text-indigo-300"
        >
          Today
        </button>
      </div>

      {/* Day strip */}
      <div className="flex gap-1">
        {days.map((day) => {
          const iso = toLocalISO(day);
          const isSelected = iso === selectedDate;
          const isToday = iso === todayISO;
          return (
            <button
              key={iso}
              onClick={() => setSelectedDate(iso)}
              className={`flex w-11 flex-col items-center rounded-xl px-1 py-2 text-xs font-medium transition ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : isToday
                  ? 'border border-indigo-500/40 bg-zinc-800 text-indigo-400'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
              }`}
            >
              <span>{DAY_NAMES[day.getDay()]}</span>
              <span className="mt-0.5 text-base font-semibold">{day.getDate()}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
