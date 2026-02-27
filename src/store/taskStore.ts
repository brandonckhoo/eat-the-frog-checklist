import { create } from 'zustand';
import type { Task, Column } from '../types';
import { taskRepository } from '../data/repositories/taskRepository';

interface TaskState {
  tasks: Task[];
  completedTasks: Task[];
  isLoaded: boolean;
  load: () => Promise<void>;
  loadCompleted: () => Promise<void>;
  reset: () => void;
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  moveTask: (taskId: string, column: Column) => Promise<void>;
  reorderTask: (taskId: string, column: Column, newIndex: number) => Promise<void>;
  completeTask: (taskId: string) => Promise<Task | null>;
  deleteTask: (taskId: string) => Promise<void>;
  getByColumn: (column: Column) => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  completedTasks: [],
  isLoaded: false,

  load: async () => {
    const tasks = await taskRepository.getActive();
    set({ tasks, isLoaded: true });
  },

  reset: () => {
    set({ tasks: [], completedTasks: [], isLoaded: false });
  },

  loadCompleted: async () => {
    const completedTasks = await taskRepository.getCompleted(30);
    set({ completedTasks });
  },

  addTask: async (task) => {
    await taskRepository.create(task);
    set((s) => ({ tasks: [task, ...s.tasks] }));
  },

  updateTask: async (task) => {
    await taskRepository.update(task);
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === task.id ? task : t)),
    }));
  },

  moveTask: async (taskId, column) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updated = { ...task, column };
    await taskRepository.update(updated);
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? updated : t)),
    }));
  },

  reorderTask: async (taskId, column, newIndex) => {
    const allTasks = get().tasks;
    const columnTasks = allTasks.filter((t) => t.column === column);
    const fromIndex = columnTasks.findIndex((t) => t.id === taskId);
    if (fromIndex === -1 || fromIndex === newIndex) return;

    const reordered = [...columnTasks];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Assign sort_order: null tasks (new) get 0 treatment via NULLS FIRST in DB.
    // Explicitly ordered tasks get 1000, 2000, 3000, ...
    const updated = reordered.map((task, idx) => ({
      ...task,
      sortOrder: (idx + 1) * 1000,
    }));

    set((s) => ({
      tasks: [
        ...s.tasks.filter((t) => t.column !== column),
        ...updated,
      ],
    }));

    await taskRepository.reorderBatch(
      updated.map((t) => ({ id: t.id, sortOrder: t.sortOrder! }))
    );
  },

  completeTask: async (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return null;
    const completed = { ...task, completedAt: Date.now() };
    await taskRepository.update(completed);
    set((s) => ({
      tasks: s.tasks.filter((t) => t.id !== taskId),
      completedTasks: [completed, ...s.completedTasks].slice(0, 30),
    }));
    return completed;
  },

  deleteTask: async (taskId) => {
    await taskRepository.delete(taskId);
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) }));
  },

  getByColumn: (column) => {
    return get().tasks.filter((t) => t.column === column);
  },
}));
