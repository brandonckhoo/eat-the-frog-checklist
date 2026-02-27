import type { Streak } from '../types';

function toDateString(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0];
}

function getToday(): string {
  return toDateString(Date.now());
}

function getYesterday(): string {
  return toDateString(Date.now() - 24 * 60 * 60 * 1000);
}

export function computeStreak(current: Streak, completionTimestamp: number): Streak {
  const completionDate = toDateString(completionTimestamp);
  const todayStr = getToday();
  const yesterdayStr = getYesterday();

  if (current.lastCompletionDate === todayStr) {
    return current;
  }

  let newCurrent: number;
  if (
    current.lastCompletionDate === yesterdayStr ||
    current.lastCompletionDate === undefined
  ) {
    newCurrent = current.current + 1;
  } else {
    newCurrent = 1;
  }

  const newBest = Math.max(newCurrent, current.best);
  return {
    current: newCurrent,
    best: newBest,
    lastCompletionDate: completionDate,
  };
}

export function isStreakActive(streak: Streak): boolean {
  if (!streak.lastCompletionDate) return false;
  const todayStr = getToday();
  const yesterdayStr = getYesterday();
  return (
    streak.lastCompletionDate === todayStr ||
    streak.lastCompletionDate === yesterdayStr
  );
}

export { getToday, getYesterday, toDateString };
