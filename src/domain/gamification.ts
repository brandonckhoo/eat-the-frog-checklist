import type { UserProgress } from '../types';

const XP_BY_DIFFICULTY: Record<1 | 2 | 3, number> = {
  1: 10,
  2: 20,
  3: 30,
};

export function xpForDifficulty(difficulty: 1 | 2 | 3): number {
  return XP_BY_DIFFICULTY[difficulty];
}

/**
 * XP needed to advance from level N to N+1 is N * 100.
 * Level 1 to 2: 100 XP
 * Level 2 to 3: 200 XP
 * Level 3 to 4: 300 XP
 */
function xpRequiredForLevel(level: number): number {
  return level * 100;
}

function cumulativeXpForLevel(targetLevel: number): number {
  let total = 0;
  for (let l = 1; l < targetLevel; l++) {
    total += xpRequiredForLevel(l);
  }
  return total;
}

export function computeLevel(totalXp: number): number {
  let level = 1;
  while (totalXp >= cumulativeXpForLevel(level + 1)) {
    level++;
  }
  return level;
}

export function computeXpProgress(totalXp: number): {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number;
} {
  const level = computeLevel(totalXp);
  const xpAtCurrentLevel = cumulativeXpForLevel(level);
  const xpIntoLevel = totalXp - xpAtCurrentLevel;
  const xpForNextLevel = xpRequiredForLevel(level);
  const progress = Math.min(xpIntoLevel / xpForNextLevel, 1);
  return { level, xpIntoLevel, xpForNextLevel, progress };
}

export function applyXp(current: UserProgress, xpToAdd: number): UserProgress {
  const newXp = current.xp + xpToAdd;
  const newLevel = computeLevel(newXp);
  return { xp: newXp, level: newLevel };
}

export function didLevelUp(before: UserProgress, after: UserProgress): boolean {
  return after.level > before.level;
}
