/**
 * Drag and drop system for the 3-column board.
 * Uses Gesture Handler + Reanimated for cross-platform drag.
 * Ghost card renders at root level via absolute positioning.
 */
import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useState,
} from 'react';
import { View, StyleSheet, LayoutRectangle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { Task, Column } from '../../types';
import { COLUMNS } from '../../theme/tokens';

interface ColumnLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DragDropContextValue {
  startDrag: (task: Task, absoluteX: number, absoluteY: number) => void;
  endDrag: (absoluteX: number) => void;
  cancelDrag: () => void;
  registerColumn: (column: Column, layout: ColumnLayout) => void;
  draggingTaskId: string | null;
}

const DragDropCtx = createContext<DragDropContextValue>({
  startDrag: () => {},
  endDrag: () => {},
  cancelDrag: () => {},
  registerColumn: () => {},
  draggingTaskId: null,
});

export function useDragDrop() {
  return useContext(DragDropCtx);
}

interface DragDropProviderProps {
  children: React.ReactNode;
  onMove: (taskId: string, toColumn: Column) => void;
}

export function DragDropProvider({ children, onMove }: DragDropProviderProps) {
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const ghostX = useSharedValue(-999);
  const ghostY = useSharedValue(-999);
  const ghostScale = useSharedValue(1);
  const columnLayouts = useRef<Partial<Record<Column, ColumnLayout>>>({});

  const registerColumn = useCallback((column: Column, layout: ColumnLayout) => {
    columnLayouts.current[column] = layout;
  }, []);

  const startDrag = useCallback(
    (task: Task, absoluteX: number, absoluteY: number) => {
      setDraggingTask(task);
      ghostX.value = absoluteX - 130;
      ghostY.value = absoluteY - 30;
      ghostScale.value = withSpring(1.06, { damping: 12 });
    },
    [ghostX, ghostY, ghostScale]
  );

  const resolveColumn = useCallback(
    (absoluteX: number): Column | null => {
      for (const col of COLUMNS) {
        const layout = columnLayouts.current[col];
        if (!layout) continue;
        if (absoluteX >= layout.x && absoluteX <= layout.x + layout.width) {
          return col;
        }
      }
      return null;
    },
    []
  );

  const endDrag = useCallback(
    (absoluteX: number) => {
      if (!draggingTask) return;
      const target = resolveColumn(absoluteX);
      if (target && target !== draggingTask.column) {
        onMove(draggingTask.id, target);
      }
      ghostScale.value = withSpring(1);
      ghostX.value = -999;
      ghostY.value = -999;
      setDraggingTask(null);
    },
    [draggingTask, resolveColumn, onMove, ghostX, ghostY, ghostScale]
  );

  const cancelDrag = useCallback(() => {
    ghostX.value = -999;
    ghostY.value = -999;
    ghostScale.value = 1;
    setDraggingTask(null);
  }, [ghostX, ghostY, ghostScale]);

  const ghostStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: ghostX.value,
    top: ghostY.value,
    width: 260,
    opacity: draggingTask ? 0.9 : 0,
    transform: [{ scale: ghostScale.value }],
    zIndex: 999,
    pointerEvents: 'none' as never,
  }));

  return (
    <DragDropCtx.Provider
      value={{
        startDrag,
        endDrag,
        cancelDrag,
        registerColumn,
        draggingTaskId: draggingTask?.id ?? null,
      }}
    >
      <View style={styles.root}>
        {children}
        {draggingTask && (
          <Animated.View style={ghostStyle}>
            <GhostCard task={draggingTask} />
          </Animated.View>
        )}
      </View>
    </DragDropCtx.Provider>
  );
}

import { Text } from 'react-native';
import { colors, radius, spacing, typography, COLUMN_CONFIG } from '../../theme/tokens';

function GhostCard({ task }: { task: Task }) {
  const config = COLUMN_CONFIG[task.column];
  return (
    <View
      style={[
        ghostStyles.card,
        {
          borderLeftColor: config.accent,
          shadowColor: config.accent,
        },
      ]}
    >
      <Text style={ghostStyles.title} numberOfLines={2}>
        {task.title}
      </Text>
    </View>
  );
}

const ghostStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.grey800,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    padding: spacing.md,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  title: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
