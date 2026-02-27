import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Modal,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import type { Task, Column } from '../../types';
import {
  COLUMN_CONFIG,
  COLUMNS,
  colors,
  spacing,
  radius,
  typography,
} from '../../theme/tokens';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface CreateEditTaskSheetProps {
  visible: boolean;
  editingTask: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onComplete?: (task: Task) => void;
}

export function CreateEditTaskSheet({
  visible,
  editingTask,
  onClose,
  onSave,
  onDelete,
  onComplete,
}: CreateEditTaskSheetProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [column, setColumn] = useState<Column>('do_first');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (visible) {
      if (editingTask) {
        setTitle(editingTask.title);
        setNotes(editingTask.notes ?? '');
        setColumn(editingTask.column);
        setDifficulty(editingTask.difficulty);
        setTags(editingTask.tags?.join(', ') ?? '');
      } else {
        setTitle('');
        setNotes('');
        setColumn('do_first');
        setDifficulty(1);
        setTags('');
      }
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, editingTask, slideAnim]);

  const handleSave = useCallback(() => {
    if (!title.trim()) return;
    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const task: Task = editingTask
      ? {
          ...editingTask,
          title: title.trim(),
          notes: notes.trim() || undefined,
          column,
          difficulty,
          tags: parsedTags,
        }
      : {
          id: generateId(),
          title: title.trim(),
          notes: notes.trim() || undefined,
          column,
          difficulty,
          tags: parsedTags,
          createdAt: Date.now(),
        };
    onSave(task);
    onClose();
  }, [title, notes, column, difficulty, tags, editingTask, onSave, onClose]);

  const handleComplete = useCallback(() => {
    if (!editingTask || !onComplete) return;
    onComplete(editingTask);
    onClose();
  }, [editingTask, onComplete, onClose]);

  const handleDelete = useCallback(() => {
    if (!editingTask || !onDelete) return;
    Alert.alert('Delete task', 'Remove this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          onDelete(editingTask.id);
          onClose();
        },
      },
    ]);
  }, [editingTask, onDelete, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.handle} />
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sheetTitle}>
              {editingTask ? 'Edit task' : 'New task'}
            </Text>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="What needs doing..."
              placeholderTextColor={colors.grey400}
              maxLength={120}
              autoFocus={!editingTask}
            />

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Optional details"
              placeholderTextColor={colors.grey400}
              multiline
              numberOfLines={3}
              maxLength={500}
            />

            <Text style={styles.label}>Column</Text>
            <View style={styles.pillRow}>
              {COLUMNS.map((col) => {
                const cfg = COLUMN_CONFIG[col];
                const active = column === col;
                return (
                  <Pressable
                    key={col}
                    style={[
                      styles.pill,
                      active && {
                        backgroundColor: cfg.dim,
                        borderColor: cfg.accent,
                      },
                    ]}
                    onPress={() => setColumn(col)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        active && { color: cfg.accent },
                      ]}
                    >
                      {cfg.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.label}>Difficulty</Text>
            <View style={styles.pillRow}>
              {([1, 2, 3] as const).map((d) => (
                <Pressable
                  key={d}
                  style={[
                    styles.pill,
                    difficulty === d && styles.pillActiveYellow,
                  ]}
                  onPress={() => setDifficulty(d)}
                >
                  <Text
                    style={[
                      styles.pillText,
                      difficulty === d && { color: colors.yellow500 },
                    ]}
                  >
                    {d === 1 ? 'Easy' : d === 2 ? 'Medium' : 'Hard'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Tags (comma separated)</Text>
            <TextInput
              style={styles.input}
              value={tags}
              onChangeText={setTags}
              placeholder="work, personal, health"
              placeholderTextColor={colors.grey400}
            />

            {editingTask && onComplete && (
              <Pressable style={styles.completeBtn} onPress={handleComplete}>
                <Text style={styles.completeBtnText}>✓  Mark complete</Text>
              </Pressable>
            )}

            <View style={styles.actions}>
              {editingTask && onDelete && (
                <Pressable style={styles.deleteBtn} onPress={handleDelete}>
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </Pressable>
              )}
              <Pressable
                style={[
                  styles.saveBtn,
                  !title.trim() && styles.saveBtnDisabled,
                ]}
                onPress={handleSave}
                disabled={!title.trim()}
              >
                <Text style={styles.saveBtnText}>
                  {editingTask ? 'Save' : 'Add task'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: colors.grey800,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.grey600,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 48,
  },
  sheetTitle: {
    ...typography.h3,
    color: colors.white,
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.label,
    color: colors.grey300,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.grey700,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.white,
    ...typography.body,
  },
  inputMulti: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pillRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  pill: {
    borderWidth: 1,
    borderColor: colors.grey600,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillActiveYellow: {
    borderColor: colors.yellow500,
    backgroundColor: colors.yellow100,
  },
  pillText: {
    ...typography.label,
    color: colors.grey300,
  },
  completeBtn: {
    backgroundColor: colors.mint,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  completeBtnText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.dark,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.yellow500,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.dark,
  },
  deleteBtn: {
    borderWidth: 1,
    borderColor: colors.coral,
    borderRadius: radius.md,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  deleteBtnText: {
    ...typography.body,
    color: colors.coral,
  },
});
