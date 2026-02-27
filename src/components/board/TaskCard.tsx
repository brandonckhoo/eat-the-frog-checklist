import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { Task } from '../../types';
import { COLUMN_CONFIG, colors, spacing, radius, typography } from '../../theme/tokens';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onComplete: (task: Task) => void;
  onDragStart?: (task: Task, absoluteX: number, absoluteY: number) => void;
}

const DIFFICULTY_LABELS = ['', '●', '●●', '●●●'];
const DIFFICULTY_COLORS = ['', colors.mint, colors.yellow500, colors.coral];

export function TaskCard({ task, onPress, onComplete }: TaskCardProps) {
  const config = COLUMN_CONFIG[task.column];
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleLongPress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    scale.value = withSequence(
      withSpring(0.94, { damping: 12 }),
      withSpring(1, { damping: 10 })
    );
    onComplete(task);
  }, [task, onComplete, scale]);

  const handlePress = useCallback(() => {
    onPress(task);
  }, [task, onPress]);

  return (
    <Pressable onPress={handlePress} onLongPress={handleLongPress} delayLongPress={500}>
      <Animated.View style={[styles.card, { borderLeftColor: config.accent }, animStyle]}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={2}>
            {task.title}
          </Text>
          <Text style={[styles.difficulty, { color: DIFFICULTY_COLORS[task.difficulty] }]}>
            {DIFFICULTY_LABELS[task.difficulty]}
          </Text>
        </View>
        {task.notes ? (
          <Text style={styles.notes} numberOfLines={2}>
            {task.notes}
          </Text>
        ) : null}
        {task.tags && task.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {task.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={[styles.tag, { borderColor: config.accent }]}>
                <Text style={[styles.tagText, { color: config.accent }]}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <Text style={styles.hint}>Hold to complete</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.grey800,
    borderRadius: radius.lg,
    borderLeftWidth: 4,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: colors.grey600,
    borderRightColor: colors.grey600,
    borderBottomColor: colors.grey600,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    flex: 1,
    lineHeight: 21,
    letterSpacing: -0.1,
  },
  difficulty: {
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  notes: {
    fontSize: 13,
    color: colors.grey300,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  tag: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  hint: {
    fontSize: 11,
    color: colors.grey600,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
});
