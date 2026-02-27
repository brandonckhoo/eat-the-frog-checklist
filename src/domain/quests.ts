import type { Quest, QuestType, Task } from '../types';

function mondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function sundayOfWeek(date: Date): Date {
  const monday = mondayOfWeek(date);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  sunday.setUTCHours(23, 59, 59, 999);
  return sunday;
}

export function getMondayString(date: Date = new Date()): string {
  return mondayOfWeek(date).toISOString().split('T')[0];
}

export function generateWeeklyQuests(weekOf: Date = new Date()): Omit<Quest, 'id'>[] {
  const startDate = mondayOfWeek(weekOf).toISOString().split('T')[0];
  const endDate = sundayOfWeek(weekOf).toISOString().split('T')[0];

  return [
    {
      type: 'complete_tasks' as QuestType,
      target: 5,
      progress: 0,
      startDate,
      endDate,
      rewardXp: 50,
    },
    {
      type: 'complete_do_first' as QuestType,
      target: 3,
      progress: 0,
      startDate,
      endDate,
      rewardXp: 30,
    },
    {
      type: 'complete_hard' as QuestType,
      target: 1,
      progress: 0,
      startDate,
      endDate,
      rewardXp: 40,
    },
    {
      type: 'maintain_streak' as QuestType,
      target: 3,
      progress: 0,
      startDate,
      endDate,
      rewardXp: 60,
    },
  ];
}

export function getQuestLabel(type: QuestType): string {
  switch (type) {
    case 'complete_tasks':
      return 'Complete 5 tasks this week';
    case 'complete_do_first':
      return 'Complete 3 Do First tasks';
    case 'complete_hard':
      return 'Complete 1 hard task';
    case 'maintain_streak':
      return 'Keep a 3 day streak';
  }
}

export function updateQuestProgress(
  quest: Quest,
  completedTask: Task,
  currentStreak: number
): Quest {
  if (quest.completedAt != null) return quest;

  let delta = 0;
  switch (quest.type) {
    case 'complete_tasks':
      delta = 1;
      break;
    case 'complete_do_first':
      delta = completedTask.column === 'do_first' ? 1 : 0;
      break;
    case 'complete_hard':
      delta = completedTask.difficulty === 3 ? 1 : 0;
      break;
    case 'maintain_streak':
      return {
        ...quest,
        progress: Math.min(currentStreak, quest.target),
        completedAt: currentStreak >= quest.target ? Date.now() : undefined,
      };
  }

  const newProgress = quest.progress + delta;
  return {
    ...quest,
    progress: Math.min(newProgress, quest.target),
    completedAt: newProgress >= quest.target ? Date.now() : undefined,
  };
}

export function isQuestForCurrentWeek(quest: Quest): boolean {
  return quest.startDate === getMondayString();
}
