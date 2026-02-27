import React, { useCallback, useEffect, useRef } from 'react';
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
  isDragging?: boolean;
  onDragStart?: (taskId: string, absoluteY: number) => void;
  onDragUpdate?: (absoluteY: number) => void;
  onDragEnd?: () => void;
}

export function TaskCard({
  task,
  onPress,
  onComplete,
  isDragging = false,
  onDragStart,
  onDragUpdate,
  onDragEnd,
}: TaskCardProps) {
  const config = COLUMN_CONFIG[task.column];
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: isDragging ? 0.35 : 1,
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

  // Drag handle responder — use refs so callbacks are always current
  const cbRef = useRef({ onDragStart, onDragUpdate, onDragEnd });
  useEffect(() => {
    cbRef.current = { onDragStart, onDragUpdate, onDragEnd };
  });

  const dragInitialY = useRef(0);
  const dragStarted = useRef(false);

  return (
    <Pressable onPress={handlePress} onLongPress={handleLongPress} delayLongPress={500}>
      <Animated.View style={[styles.card, { borderLeftColor: config.accent }, animStyle]}>
        <View style={styles.row}>
          {/* Drag handle */}
          <View
            style={styles.dragHandle}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderGrant={(e) => {
              dragInitialY.current = e.nativeEvent.pageY;
              dragStarted.current = false;
            }}
            onResponderMove={(e) => {
              const y = e.nativeEvent.pageY;
              if (!dragStarted.current) {
                if (Math.abs(y - dragInitialY.current) < 5) return;
                dragStarted.current = true;
                cbRef.current.onDragStart?.(task.id, y);
              }
              cbRef.current.onDragUpdate?.(y);
            }}
            onResponderRelease={() => {
              if (dragStarted.current) cbRef.current.onDragEnd?.();
              dragStarted.current = false;
            }}
            onResponderTerminate={() => {
              if (dragStarted.current) cbRef.current.onDragEnd?.();
              dragStarted.current = false;
            }}
          >
            <Text style={styles.dragIcon}>⠿</Text>
          </View>

          {/* Card content */}
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {task.title}
            </Text>
            {task.notes ? (
              <Text style={styles.notes} numberOfLines={1}>
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
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.grey800,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: colors.grey700,
    borderRightColor: colors.grey700,
    borderBottomColor: colors.grey700,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  dragHandle: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.grey700,
  },
  dragIcon: {
    fontSize: 13,
    color: colors.grey600,
    lineHeight: 18,
  },
  content: {
    flex: 1,
    padding: spacing.sm,
    paddingLeft: spacing.md,
    gap: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  notes: {
    fontSize: 11,
    color: colors.grey400,
    lineHeight: 15,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  tag: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
