import {
  xpForDifficulty,
  computeLevel,
  computeXpProgress,
  applyXp,
  didLevelUp,
} from '../src/domain/gamification';

describe('xpForDifficulty', () => {
  it('returns 10 for difficulty 1', () => {
    expect(xpForDifficulty(1)).toBe(10);
  });
  it('returns 20 for difficulty 2', () => {
    expect(xpForDifficulty(2)).toBe(20);
  });
  it('returns 30 for difficulty 3', () => {
    expect(xpForDifficulty(3)).toBe(30);
  });
});

describe('computeLevel', () => {
  it('starts at level 1 with 0 XP', () => {
    expect(computeLevel(0)).toBe(1);
  });
  it('stays level 1 with 99 XP', () => {
    expect(computeLevel(99)).toBe(1);
  });
  it('reaches level 2 at exactly 100 XP', () => {
    expect(computeLevel(100)).toBe(2);
  });
  it('reaches level 3 at 300 XP (100 + 200)', () => {
    expect(computeLevel(300)).toBe(3);
  });
  it('reaches level 4 at 600 XP (100 + 200 + 300)', () => {
    expect(computeLevel(600)).toBe(4);
  });
  it('stays level 3 at 599 XP', () => {
    expect(computeLevel(599)).toBe(3);
  });
});

describe('computeXpProgress', () => {
  it('returns correct progress within a level', () => {
    const result = computeXpProgress(150);
    expect(result.level).toBe(2);
    expect(result.xpIntoLevel).toBe(50);
    expect(result.xpForNextLevel).toBe(200);
    expect(result.progress).toBeCloseTo(0.25);
  });

  it('returns 0 progress at level boundary', () => {
    const result = computeXpProgress(100);
    expect(result.level).toBe(2);
    expect(result.xpIntoLevel).toBe(0);
    expect(result.progress).toBe(0);
  });
});

describe('applyXp', () => {
  it('adds XP and updates level', () => {
    const before = { xp: 90, level: 1 };
    const after = applyXp(before, 20);
    expect(after.xp).toBe(110);
    expect(after.level).toBe(2);
  });

  it('does not change level when not crossing threshold', () => {
    const before = { xp: 0, level: 1 };
    const after = applyXp(before, 50);
    expect(after.level).toBe(1);
  });
});

describe('didLevelUp', () => {
  it('returns true when level increased', () => {
    expect(didLevelUp({ xp: 90, level: 1 }, { xp: 110, level: 2 })).toBe(true);
  });
  it('returns false when level unchanged', () => {
    expect(didLevelUp({ xp: 0, level: 1 }, { xp: 50, level: 1 })).toBe(false);
  });
});
