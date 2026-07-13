import { create } from 'zustand';

interface DateState {
  selectedDate: string; // ISO date: YYYY-MM-DD
  setSelectedDate: (date: string) => void;
}

/** Use local calendar date to avoid UTC-offset issues (e.g. UTC+5:30 at midnight). */
function toLocalISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const useDateStore = create<DateState>((set) => ({
  selectedDate: toLocalISO(new Date()),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
