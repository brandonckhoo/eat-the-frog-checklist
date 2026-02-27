export type Column = 'do_first' | 'do_later' | 'do_free';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  column: Column;
  createdAt: number;
  dueAt?: number;
  completedAt?: number;
  difficulty: 1 | 2 | 3;
  tags?: string[];
}

export interface CompletionEvent {
  id: string;
  taskId: string;
  timestamp: number;
  xpAwarded: number;
}

export interface Streak {
  current: number;
  best: number;
  lastCompletionDate?: string;
}

export type QuestType =
  | 'complete_tasks'
  | 'complete_do_first'
  | 'complete_hard'
  | 'maintain_streak';

export interface Quest {
  id: string;
  type: QuestType;
  target: number;
  progress: number;
  startDate: string;
  endDate: string;
  rewardXp: number;
  completedAt?: number;
}

export type BadgeType =
  | 'first_task'
  | 'streak_3'
  | 'streak_7'
  | 'tasks_10'
  | 'tasks_50'
  | 'tasks_100';

export interface Badge {
  id: string;
  type: BadgeType;
  unlockedAt?: number;
}

export interface UserProgress {
  xp: number;
  level: number;
}
