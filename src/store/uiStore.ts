import { create } from 'zustand';
import type { Task, BadgeType } from '../types';

interface UiState {
  taskSheetVisible: boolean;
  editingTask: Task | null;
  openCreateSheet: () => void;
  openEditSheet: (task: Task) => void;
  closeTaskSheet: () => void;

  celebrationVisible: boolean;
  celebrationXp: number;
  showCelebration: (xp: number) => void;
  hideCelebration: () => void;

  pendingBadges: BadgeType[];
  queueBadges: (types: BadgeType[]) => void;
  dismissBadge: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  taskSheetVisible: false,
  editingTask: null,
  openCreateSheet: () => set({ taskSheetVisible: true, editingTask: null }),
  openEditSheet: (task) => set({ taskSheetVisible: true, editingTask: task }),
  closeTaskSheet: () => set({ taskSheetVisible: false, editingTask: null }),

  celebrationVisible: false,
  celebrationXp: 0,
  showCelebration: (xp) => set({ celebrationVisible: true, celebrationXp: xp }),
  hideCelebration: () => set({ celebrationVisible: false, celebrationXp: 0 }),

  pendingBadges: [],
  queueBadges: (types) =>
    set((s) => ({ pendingBadges: [...s.pendingBadges, ...types] })),
  dismissBadge: () =>
    set((s) => ({ pendingBadges: s.pendingBadges.slice(1) })),
}));
