import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  LayoutChangeEvent,
} from 'react-native';
import { TaskCard } from './TaskCard';
import { useDragDrop } from './DragDropContext';
import { useTaskStore } from '../../store/taskStore';
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
  const { registerColumn } = useDragDrop();
  const { reorderTask } = useTaskStore();
  const viewRef = useRef<View>(null);

  // --- drag-reorder state ---
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);

  // Refs always hold the latest values so the stable handleDragEnd callback
  // can read them without stale-closure issues.
  const dragStateRef = useRef({ draggingId: null as string | null, dropIdx: null as number | null });
  dragStateRef.current = { draggingId, dropIdx };

  const scrollScreenY = useRef(0);
  const scrollOffset = useRef(0);
  const cardHeights = useRef<number[]>([]);
  const scrollContainerRef = useRef<View>(null);

  // Register column layout for cross-column drag context
  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width: w, height: h } = e.nativeEvent.layout;
      viewRef.current?.measureInWindow((wx, wy) => {
        registerColumn(column, { x: wx, y: wy, width: w, height: h });
      });
    },
    [column, registerColumn]
  );

  // Measure the scroll container's screen Y so we can convert absoluteY → relY
  const handleScrollContainerLayout = useCallback(() => {
    scrollContainerRef.current?.measureInWindow((_x, y) => {
      scrollScreenY.current = y;
    });
  }, []);

  const computeDropIdx = useCallback(
    (absoluteY: number): number => {
      const relY = absoluteY - scrollScreenY.current + scrollOffset.current;
      let acc = 0;
      for (let i = 0; i < tasks.length; i++) {
        const h = cardHeights.current[i] ?? 56;
        if (relY < acc + h * 0.5) return i;
        acc += h;
      }
      return tasks.length;
    },
    [tasks.length]
  );

  const handleDragStart = useCallback(
    (taskId: string, absoluteY: number) => {
      setDraggingId(taskId);
      setDropIdx(computeDropIdx(absoluteY));
    },
    [computeDropIdx]
  );

  const handleDragUpdate = useCallback(
    (absoluteY: number) => {
      setDropIdx(computeDropIdx(absoluteY));
    },
    [computeDropIdx]
  );

  // Stable: reads from ref so it doesn't need draggingId/dropIdx as deps
  const handleDragEnd = useCallback(() => {
    const { draggingId: id, dropIdx: di } = dragStateRef.current;
    const fromIdx = id ? tasks.findIndex((t) => t.id === id) : -1;
    if (fromIdx !== -1 && di !== null) {
      const newIdx = di > fromIdx ? di - 1 : di;
      if (newIdx !== fromIdx) {
        reorderTask(id!, column, newIdx);
      }
    }
    setDraggingId(null);
    setDropIdx(null);
  }, [tasks, column, reorderTask]);

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

      <View ref={scrollContainerRef} style={styles.scrollContainer} onLayout={handleScrollContainerLayout}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!draggingId}
          onScroll={(e) => {
            scrollOffset.current = e.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
        >
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🐸</Text>
              <Text style={styles.emptyText}>All clear!</Text>
              <Text style={styles.emptySubtext}>Add a task to get started</Text>
            </View>
          ) : (
            <>
              {tasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  {dropIdx === index && draggingId && <DropLine />}
                  <View
                    onLayout={(e) => {
                      cardHeights.current[index] = e.nativeEvent.layout.height;
                    }}
                  >
                    <TaskCard
                      task={task}
                      onPress={onPressTask}
                      onComplete={onCompleteTask}
                      isDragging={task.id === draggingId}
                      onDragStart={handleDragStart}
                      onDragUpdate={handleDragUpdate}
                      onDragEnd={handleDragEnd}
                    />
                  </View>
                </React.Fragment>
              ))}
              {dropIdx === tasks.length && draggingId && <DropLine />}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function DropLine() {
  return <View style={dropLineStyle} />;
}

const dropLineStyle: import('react-native').ViewStyle = {
  height: 2,
  backgroundColor: colors.yellow500,
  borderRadius: 1,
  marginBottom: spacing.sm,
  marginHorizontal: 4,
  opacity: 0.8,
};

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
  scrollContainer: {
    flex: 1,
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
