import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import type { Exercise } from '../../types';
import { theme } from '../../theme';

interface Props {
  exercise: Exercise;
  onPress?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  onProgressMain?: () => void;
  onProgressBackoff?: () => void;
}

export function ExerciseRow({
  exercise,
  onPress,
  onMoveUp,
  onMoveDown,
  onDelete,
  onProgressMain,
  onProgressBackoff,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.row} onPress={onPress}>
        {exercise.imageUrl ? (
          <Image source={{ uri: exercise.imageUrl }} style={styles.thumb} />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Text style={styles.thumbInitial}>{exercise.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{exercise.name}</Text>
            {exercise.shared && (
              <View style={styles.sharedBadge}>
                <Text style={styles.sharedBadgeText}>SHARED</Text>
              </View>
            )}
          </View>
          <Text style={styles.setLine}>
            <Text style={styles.setLabel}>Main  </Text>
            {exercise.mainWeight} {exercise.weightUnit}
            <Text style={styles.goal}>  (goal: {exercise.mainRepTarget} reps)</Text>
          </Text>
          <Text style={styles.setLine}>
            <Text style={styles.setLabel}>Backoff  </Text>
            {exercise.backoffWeight} {exercise.weightUnit}
            <Text style={styles.goal}>  (goal: {exercise.backoffRepTarget} reps)</Text>
          </Text>
          <Text style={styles.target}>+{exercise.weightIncrement} {exercise.weightUnit} increment</Text>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={onMoveUp} hitSlop={6} style={[styles.arrowBtn, !onMoveUp && styles.arrowDisabled]}>
            <Text style={styles.arrow}>▲</Text>
          </Pressable>
          <Pressable onPress={onMoveDown} hitSlop={6} style={[styles.arrowBtn, !onMoveDown && styles.arrowDisabled]}>
            <Text style={styles.arrow}>▼</Text>
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={6} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>✕</Text>
          </Pressable>
        </View>
      </Pressable>

      {/* Progress row */}
      <View style={styles.progressRow}>
        <Pressable style={styles.progressBtn} onPress={onProgressMain}>
          <Text style={styles.progressText}>↑ Main (+{exercise.weightIncrement} {exercise.weightUnit})</Text>
        </Pressable>
        <Pressable style={styles.progressBtn} onPress={onProgressBackoff}>
          <Text style={styles.progressText}>↑ Backoff (+{exercise.weightIncrement} {exercise.weightUnit})</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: theme.colors.border,
    padding: 12,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  thumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceRaised,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  thumbInitial: {
    color: theme.colors.accent,
    fontSize: 20,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  name: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  sharedBadge: {
    backgroundColor: theme.colors.accentMuted,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.accentDim,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  sharedBadgeText: {
    color: theme.colors.accent,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  setLabel: {
    color: theme.colors.textTertiary,
    fontSize: 12,
    fontWeight: '600',
  },
  setLine: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 1,
  },
  goal: {
    color: theme.colors.textTertiary,
    fontSize: 11,
  },
  target: {
    color: theme.colors.textTertiary,
    fontSize: 11,
    marginTop: 3,
  },
  controls: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  arrowBtn: { padding: 4 },
  arrowDisabled: { opacity: 0.2 },
  arrow: { color: theme.colors.textTertiary, fontSize: 12 },
  deleteBtn: { padding: 4 },
  deleteText: { color: theme.colors.error, fontSize: 14 },
  progressRow: {
    flexDirection: 'row',
    borderBottomLeftRadius: theme.radii.md,
    borderBottomRightRadius: theme.radii.md,
    overflow: 'hidden',
  },
  progressBtn: {
    flex: 1,
    backgroundColor: theme.colors.successSurface,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: theme.colors.successBorder,
  },
  progressText: {
    color: theme.colors.success,
    fontSize: 13,
    fontWeight: '600',
  },
});
