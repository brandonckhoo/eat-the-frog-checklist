import { create } from 'zustand';
import type { Task, Column } from '../types';
import { taskRepository } from '../data/repositories/taskRepository';

interface TaskState {
  tasks: Task[];
  completedTasks: Task[];
  isLoaded: boolean;
  load: () => Promise<void>;
  loadCompleted: () => Promise<void>;
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  moveTask: (taskId: string, column: Column) => Promise<void>;
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
