import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PipMascot } from '../mascot/PipMascot';
import { useProgressStore } from '../../store/progressStore';
import { computeXpProgress } from '../../domain/gamification';
import { isStreakActive } from '../../domain/streaks';
import { colors, spacing, typography } from '../../theme/tokens';

export function Header() {
  const insets = useSafeAreaInsets();
  const { progress, streak } = useProgressStore();
  const { level, xpIntoLevel, xpForNextLevel, progress: xpProgress } = computeXpProgress(progress.xp);
  const streakActive = isStreakActive(streak);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top - 28, 4) }]}>
      {/* Top row: mascot + app name + streak pill */}
      <View style={styles.topRow}>
        <PipMascot state="idle" size={56} />
        <Text style={styles.appName}>Eat the Frog</Text>
        <View style={[styles.streakPill, streakActive && styles.streakPillActive]}>
          <Text style={styles.streakFire}>{streakActive ? '🔥' : '💤'}</Text>
          <Text style={[styles.streakCount, streakActive && styles.streakCountActive]}>
            {streak.current} {streak.current === 1 ? 'day' : 'days'}
          </Text>
        </View>
      </View>

      {/* XP row */}
      <View style={styles.xpSection}>
        <View style={styles.xpLabelRow}>
          <Text style={styles.levelLabel}>Level {level}</Text>
          <Text style={styles.xpLabel}>{xpIntoLevel} / {xpForNextLevel} XP</Text>
        </View>
        <View style={styles.xpBarWrap}>
          <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.black800,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  appName: {
    flex: 1,
    fontSize: 19,
    fontWeight: '800',
    color: colors.yellow500,
    letterSpacing: -0.4,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.grey800,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: colors.grey600,
  },
  streakPillActive: {
    borderColor: colors.coral,
    backgroundColor: 'rgba(255,107,107,0.1)',
  },
  streakFire: {
    fontSize: 16,
  },
  streakCount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.grey300,
  },
  streakCountActive: {
    color: colors.coral,
  },
  xpSection: {
    gap: spacing.xs,
  },
  xpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  levelLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  xpLabel: {
    ...typography.caption,
    color: colors.grey300,
  },
  xpBarWrap: {
    height: 10,
    backgroundColor: colors.grey700,
    borderRadius: 6,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.yellow500,
    borderRadius: 6,
  },
});
