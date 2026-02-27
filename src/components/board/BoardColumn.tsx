import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  LayoutChangeEvent,
} from 'react-native';
import { TaskCard } from './TaskCard';
import { useDragDrop } from './DragDropContext';
import type { Task, Column } from '../../types';
import { COLUMN_CONFIG, colors, spacing, radius, typography } from '../../theme/tokens';

interface BoardColumnProps {
  column: Column;
  tasks: Task[];
  onPressTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  width: number;
}

export function BoardColumn({
  column,
  tasks,
  onPressTask,
  onCompleteTask,
  width,
}: BoardColumnProps) {
  const config = COLUMN_CONFIG[column];
  const { registerColumn, startDrag, endDrag, draggingTaskId } = useDragDrop();
  const viewRef = useRef<View>(null);

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { x, y, width: w, height: h } = e.nativeEvent.layout;
      viewRef.current?.measureInWindow((wx, wy) => {
        registerColumn(column, { x: wx, y: wy, width: w, height: h });
      });
    },
    [column, registerColumn]
  );

  const handleDragStart = useCallback(
    (task: Task, absoluteX: number, absoluteY: number) => {
      startDrag(task, absoluteX, absoluteY);
    },
    [startDrag]
  );

  return (
    <View
      ref={viewRef}
      style={[styles.column, { width }]}
      onLayout={handleLayout}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.columnLabel}>{config.label}</Text>
          <Text style={styles.columnSub}>{config.subtitle}</Text>
        </View>
        <View style={[styles.countBadge, { backgroundColor: config.dim, borderColor: config.border }]}>
          <Text style={[styles.countText, { color: config.accent }]}>{tasks.length}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled
      >
        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🐸</Text>
            <Text style={styles.emptyText}>All clear!</Text>
            <Text style={styles.emptySubtext}>Add a task to get started</Text>
          </View>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onPress={onPressTask}
              onComplete={onCompleteTask}
              onDragStart={handleDragStart}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  columnLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.2,
  },
  columnSub: {
    ...typography.caption,
    color: colors.grey400,
    marginTop: 2,
  },
  countBadge: {
    borderWidth: 1.5,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.grey400,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.grey600,
  },
});
