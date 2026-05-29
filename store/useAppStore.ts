import { create } from 'zustand'

interface AppState {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedMonth: new Date().toISOString().slice(0, 7), // Format: "YYYY-MM"
  setSelectedMonth: (month) => set({ selectedMonth: month }),
}))
