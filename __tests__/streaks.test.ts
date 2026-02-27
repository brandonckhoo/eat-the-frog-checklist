import { computeStreak, isStreakActive } from '../src/domain/streaks';
import type { Streak } from '../src/types';

function makeTimestamp(dateStr: string): number {
  return new Date(dateStr + 'T12:00:00Z').getTime();
}

describe('computeStreak', () => {
  it('starts streak at 1 for first ever completion', () => {
    const streak: Streak = { current: 0, best: 0 };
    const ts = makeTimestamp('2026-01-01');
    const result = computeStreak(streak, ts);
    expect(result.current).toBe(1);
    expect(result.best).toBe(1);
  });

  it('increments streak on consecutive day', () => {
    const streak: Streak = {
      current: 2,
      best: 2,
      lastCompletionDate: '2026-01-01',
    };
    jest.spyOn(Date, 'now').mockReturnValue(makeTimestamp('2026-01-02'));
    const result = computeStreak(streak, makeTimestamp('2026-01-02'));
    expect(result.current).toBe(3);
    expect(result.best).toBe(3);
    jest.restoreAllMocks();
  });

  it('resets streak when more than 1 day missed', () => {
    const streak: Streak = {
      current: 5,
      best: 5,
      lastCompletionDate: '2026-01-01',
    };
    jest.spyOn(Date, 'now').mockReturnValue(makeTimestamp('2026-01-05'));
    const result = computeStreak(streak, makeTimestamp('2026-01-05'));
    expect(result.current).toBe(1);
    expect(result.best).toBe(5);
    jest.restoreAllMocks();
  });

  it('does not increment twice on same day', () => {
    const streak: Streak = {
      current: 3,
      best: 3,
      lastCompletionDate: '2026-01-01',
    };
    jest.spyOn(Date, 'now').mockReturnValue(makeTimestamp('2026-01-01'));
    const result = computeStreak(streak, makeTimestamp('2026-01-01'));
    expect(result.current).toBe(3);
    jest.restoreAllMocks();
  });

  it('updates best when current exceeds it', () => {
    const streak: Streak = {
      current: 7,
      best: 7,
      lastCompletionDate: '2026-01-07',
    };
    jest.spyOn(Date, 'now').mockReturnValue(makeTimestamp('2026-01-08'));
    const result = computeStreak(streak, makeTimestamp('2026-01-08'));
    expect(result.best).toBe(8);
    jest.restoreAllMocks();
  });
});
