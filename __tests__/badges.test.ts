import { checkNewBadges, ALL_BADGE_DEFINITIONS } from '../src/domain/badges';
import type { Badge, Streak } from '../src/types';

function makeLockedBadges(): Badge[] {
  return ALL_BADGE_DEFINITIONS.map((d) => ({ id: d.type, type: d.type }));
}

const emptyStreak: Streak = { current: 0, best: 0 };

describe('checkNewBadges', () => {
  it('unlocks first_task on first completion', () => {
    const result = checkNewBadges({
      totalCompletions: 1,
      streak: emptyStreak,
      existingBadges: makeLockedBadges(),
    });
    expect(result).toContain('first_task');
  });

  it('does not re-unlock already unlocked badges', () => {
    const badges: Badge[] = [
      { id: 'first_task', type: 'first_task', unlockedAt: Date.now() },
      ...ALL_BADGE_DEFINITIONS.filter((d) => d.type !== 'first_task').map((d) => ({
        id: d.type,
        type: d.type,
      })),
    ];
    const result = checkNewBadges({
      totalCompletions: 1,
      streak: emptyStreak,
      existingBadges: badges,
    });
    expect(result).not.toContain('first_task');
  });

  it('unlocks streak_3 when best streak is 3', () => {
    const result = checkNewBadges({
      totalCompletions: 0,
      streak: { current: 3, best: 3 },
      existingBadges: makeLockedBadges(),
    });
    expect(result).toContain('streak_3');
    expect(result).not.toContain('streak_7');
  });

  it('unlocks streak_7 when best streak is 7', () => {
    const result = checkNewBadges({
      totalCompletions: 0,
      streak: { current: 7, best: 7 },
      existingBadges: makeLockedBadges(),
    });
    expect(result).toContain('streak_3');
    expect(result).toContain('streak_7');
  });

  it('unlocks tasks_10 at exactly 10 completions', () => {
    const result = checkNewBadges({
      totalCompletions: 10,
      streak: emptyStreak,
      existingBadges: makeLockedBadges(),
    });
    expect(result).toContain('tasks_10');
    expect(result).not.toContain('tasks_50');
  });

  it('unlocks tasks_50 and tasks_100 at 100 completions', () => {
    const result = checkNewBadges({
      totalCompletions: 100,
      streak: emptyStreak,
      existingBadges: makeLockedBadges(),
    });
    expect(result).toContain('tasks_10');
    expect(result).toContain('tasks_50');
    expect(result).toContain('tasks_100');
  });

  it('returns empty array when all badges already unlocked', () => {
    const allUnlocked: Badge[] = ALL_BADGE_DEFINITIONS.map((d) => ({
      id: d.type,
      type: d.type,
      unlockedAt: Date.now(),
    }));
    const result = checkNewBadges({
      totalCompletions: 999,
      streak: { current: 99, best: 99 },
      existingBadges: allUnlocked,
    });
    expect(result).toHaveLength(0);
  });
});
