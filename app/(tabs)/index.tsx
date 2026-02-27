import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useTaskStore } from '../../src/store/taskStore';
import { useProgressStore } from '../../src/store/progressStore';
import { useUiStore } from '../../src/store/uiStore';
import { Header } from '../../src/components/ui/Header';
import { BoardColumn } from '../../src/components/board/BoardColumn';
import { FloatingAddButton } from '../../src/components/board/FloatingAddButton';
import { DragDropProvider } from '../../src/components/board/DragDropContext';
import { CreateEditTaskSheet } from '../../src/components/modals/CreateEditTaskSheet';
import { CelebrationModal } from '../../src/components/modals/CelebrationModal';
import { BadgeUnlockModal } from '../../src/components/modals/BadgeUnlockModal';
import type { Task, Column } from '../../src/types';
import { COLUMNS, COLUMN_CONFIG, colors, spacing, radius, typography } from '../../src/theme/tokens';

const COLUMN_NUMBERS: Record<Column, string> = {
  do_first: '1',
  do_later: '2',
  do_free: '3',
};

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const isWide = Platform.OS !== 'web' && width >= 700;

  const [activeColumn, setActiveColumn] = useState<Column>('do_first');

  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const moveTask = useTaskStore((s) => s.moveTask);
  const completeTask = useTaskStore((s) => s.completeTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const recordCompletion = useProgressStore((s) => s.recordCompletion);

  const {
    taskSheetVisible,
    editingTask,
    openCreateSheet,
    openEditSheet,
    closeTaskSheet,
    celebrationVisible,
    celebrationXp,
    showCelebration,
    hideCelebration,
    pendingBadges,
    queueBadges,
    dismissBadge,
  } = useUiStore();

  const handleComplete = useCallback(
    async (task: Task) => {
      const completed = await completeTask(task.id);
      if (!completed) return;
      const result = await recordCompletion(completed);
      showCelebration(result.xpAwarded);
      if (result.newBadges.length > 0) {
        queueBadges(result.newBadges);
      }
    },
    [completeTask, recordCompletion, showCelebration, queueBadges]
  );

  const handleSaveTask = useCallback(
    async (task: Task) => {
      if (editingTask) {
        await updateTask(task);
      } else {
        await addTask(task);
      }
    },
    [editingTask, updateTask, addTask]
  );

  const handleMove = useCallback(
    async (taskId: string, toColumn: Column) => {
      await moveTask(taskId, toColumn);
    },
    [moveTask]
  );

  const columnWidth = Math.floor(width - 32);

  return (
    <DragDropProvider onMove={handleMove}>
      <View style={styles.container}>
        <Header />

        {/* Numbered column tab bar */}
        <View style={styles.tabBar}>
          {COLUMNS.map((col) => {
            const cfg = COLUMN_CONFIG[col];
            const active = activeColumn === col;
            const count = tasks.filter((t) => t.column === col).length;
            return (
              <Pressable
                key={col}
                style={[
                  styles.tab,
                  active && { borderBottomColor: cfg.accent, borderBottomWidth: 3 },
                ]}
                onPress={() => setActiveColumn(col)}
              >
                <View style={styles.tabInner}>
                  <View
                    style={[
                      styles.tabNumber,
                      { backgroundColor: active ? cfg.accent : colors.grey800 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabNumberText,
                        { color: active ? colors.black800 : colors.grey400 },
                      ]}
                    >
                      {COLUMN_NUMBERS[col]}
                    </Text>
                  </View>
                  <View style={styles.tabLabels}>
                    <Text
                      style={[
                        styles.tabLabel,
                        { color: active ? cfg.accent : colors.grey400 },
                      ]}
                      numberOfLines={1}
                    >
                      {cfg.label}
                    </Text>
                    <Text style={styles.tabSub} numberOfLines={1}>
                      {count} {count !== 1 ? 'tasks' : 'task'}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Active column */}
        <View style={styles.board}>
          {isWide ? (
            <View style={styles.wideRow}>
              {COLUMNS.map((col) => (
                <BoardColumn
                  key={col}
                  column={col}
                  tasks={tasks.filter((t) => t.column === col)}
                  onPressTask={openEditSheet}
                  onCompleteTask={handleComplete}
                  width={Math.floor((width - 48) / 3)}
                />
              ))}
            </View>
          ) : (
            <BoardColumn
              column={activeColumn}
              tasks={tasks.filter((t) => t.column === activeColumn)}
              onPressTask={openEditSheet}
              onCompleteTask={handleComplete}
              width={columnWidth}
            />
          )}
        </View>

        <FloatingAddButton onPress={openCreateSheet} />

        <CreateEditTaskSheet
          visible={taskSheetVisible}
          editingTask={editingTask}
          onClose={closeTaskSheet}
          onSave={handleSaveTask}
          onDelete={deleteTask}
          onComplete={handleComplete}
        />

        <CelebrationModal
          visible={celebrationVisible}
          xpAwarded={celebrationXp}
          onDismiss={hideCelebration}
        />

        <BadgeUnlockModal
          badgeType={pendingBadges[0] ?? null}
          onDismiss={dismissBadge}
        />
      </View>
    </DragDropProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black800,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 0,
    backgroundColor: colors.black800,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey700,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: 2,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  tabInner: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  tabNumber: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tabNumberText: {
    fontSize: 14,
    fontWeight: '800',
  },
  tabLabels: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.1,
    textAlign: 'center',
  },
  tabSub: {
    fontSize: 10,
    color: colors.grey400,
    marginTop: 1,
    textAlign: 'center',
  },
  board: {
    flex: 1,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  wideRow: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
