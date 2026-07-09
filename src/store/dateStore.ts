import { create } from 'zustand';

interface DateState {
  selectedDate: string; // ISO date: YYYY-MM-DD
  setSelectedDate: (date: string) => void;
}

const toISODate = (d: Date) => d.toISOString().split('T')[0];

export const useDateStore = create<DateState>((set) => ({
  selectedDate: toISODate(new Date()),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
