import type { Badge, BadgeType, Streak } from '../types';

export interface BadgeCheckInput {
  totalCompletions: number;
  streak: Streak;
  existingBadges: Badge[];
}

export interface BadgeDefinition {
  type: BadgeType;
  label: string;
  description: string;
  emoji: string;
  check: (input: BadgeCheckInput) => boolean;
}

export const ALL_BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    type: 'first_task',
    label: 'First Step',
    description: 'Complete your first task',
    emoji: '🌱',
    check: ({ totalCompletions }) => totalCompletions >= 1,
  },
  {
    type: 'streak_3',
    label: '3 Day Streak',
    description: 'Complete tasks 3 days in a row',
    emoji: '🔥',
    check: ({ streak }) => streak.best >= 3,
  },
  {
    type: 'streak_7',
    label: '7 Day Streak',
    description: 'Complete tasks 7 days in a row',
    emoji: '⚡',
    check: ({ streak }) => streak.best >= 7,
  },
  {
    type: 'tasks_10',
    label: '10 Tasks',
    description: 'Complete 10 tasks total',
    emoji: '✨',
    check: ({ totalCompletions }) => totalCompletions >= 10,
  },
  {
    type: 'tasks_50',
    label: '50 Tasks',
    description: 'Complete 50 tasks total',
    emoji: '🏆',
    check: ({ totalCompletions }) => totalCompletions >= 50,
  },
  {
    type: 'tasks_100',
    label: '100 Tasks',
    description: 'Complete 100 tasks total',
    emoji: '💎',
    check: ({ totalCompletions }) => totalCompletions >= 100,
  },
];

export function checkNewBadges(input: BadgeCheckInput): BadgeType[] {
  const unlockedTypes = new Set(
    input.existingBadges
      .filter((b) => b.unlockedAt != null)
      .map((b) => b.type)
  );
  return ALL_BADGE_DEFINITIONS.filter(
    (def) => !unlockedTypes.has(def.type) && def.check(input)
  ).map((def) => def.type);
}

export function getBadgeDefinition(type: BadgeType): BadgeDefinition | undefined {
  return ALL_BADGE_DEFINITIONS.find((d) => d.type === type);
}
