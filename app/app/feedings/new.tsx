import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, HelperText, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { FormScreen } from '@/components/FormScreen';
import { radii, spacing } from '@/constants';
import { useCreateFeeding } from '@/features/feedings/queries';
import { useActiveChild } from '@/stores/activeChild';
import type { FeedingKind } from '@/types/domain';

const KIND_OPTIONS: { value: FeedingKind; label: string }[] = [
  { value: 'breast_left', label: 'Груди (ліва)' },
  { value: 'breast_right', label: 'Груди (права)' },
  { value: 'bottle_breast_milk', label: 'Пляшечка (молоко)' },
  { value: 'bottle_formula', label: 'Пляшечка (суміш)' },
  { value: 'solid', label: 'Прикорм' },
];

export default function NewFeedingScreen() {
  const router = useRouter();
  const activeChildId = useActiveChild((s) => s.activeChildId);
  const createFeeding = useCreateFeeding();

  const [kind, setKind] = useState<FeedingKind>('breast_left');
  const [durationMin, setDurationMin] = useState('');
  const [amountMl, setAmountMl] = useState('');
  const [solidFood, setSolidFood] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isBreast = kind === 'breast_left' || kind === 'breast_right';
  const isBottle = kind === 'bottle_breast_milk' || kind === 'bottle_formula';
  const isSolid = kind === 'solid';

  const onSubmit = async () => {
    if (!activeChildId) {
      setError('Спочатку обери дитину');
      return;
    }
    setError(null);

    const now = new Date();
    const startedAt = new Date(now);
    let endedAt: Date | null = null;

    if (isBreast && durationMin) {
      const mins = parseInt(durationMin, 10);
      if (Number.isFinite(mins) && mins > 0) {
        startedAt.setMinutes(now.getMinutes() - mins);
        endedAt = now;
      }
    }

    try {
      await createFeeding.mutateAsync({
        child_id: activeChildId,
        kind,
        started_at: startedAt.toISOString(),
        ended_at: endedAt?.toISOString() ?? null,
        amount_ml: isBottle && amountMl ? Number(amountMl) : null,
        solid_food: isSolid && solidFood.trim() ? solidFood.trim() : null,
        notes: notes.trim() || null,
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося зберегти');
    }
  };

  return (
    <FormScreen>
      <View style={styles.section}>
        <Text variant="labelLarge">Тип годування</Text>
        <SegmentedButtons
          value={kind}
          onValueChange={(v) => setKind(v as FeedingKind)}
          buttons={KIND_OPTIONS.slice(0, 2)}
        />
        <SegmentedButtons
          value={kind}
          onValueChange={(v) => setKind(v as FeedingKind)}
          buttons={KIND_OPTIONS.slice(2, 4)}
        />
        <SegmentedButtons
          value={kind}
          onValueChange={(v) => setKind(v as FeedingKind)}
          buttons={[KIND_OPTIONS[4]]}
        />
      </View>

      {isBreast ? (
        <TextInput
          label="Тривалість (хвилини)"
          value={durationMin}
          onChangeText={setDurationMin}
          mode="outlined"
          keyboardType="number-pad"
          placeholder="наприклад, 15"
        />
      ) : null}

      {isBottle ? (
        <TextInput
          label="Об'єм (мл)"
          value={amountMl}
          onChangeText={setAmountMl}
          mode="outlined"
          keyboardType="number-pad"
          placeholder="наприклад, 120"
        />
      ) : null}

      {isSolid ? (
        <TextInput
          label="Що їла"
          value={solidFood}
          onChangeText={setSolidFood}
          mode="outlined"
          placeholder="наприклад, пюре банан"
        />
      ) : null}

      <TextInput
        label="Нотатки (необов'язково)"
        value={notes}
        onChangeText={setNotes}
        mode="outlined"
        multiline
        numberOfLines={2}
      />

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={createFeeding.isPending}
        disabled={createFeeding.isPending}
        style={styles.submit}
      >
        Зберегти
      </Button>

      <Text variant="bodySmall" style={styles.hint}>
        Час запису: зараз{isBreast && durationMin ? ` (− ${durationMin} хв)` : ''}
      </Text>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  submit: { marginTop: spacing.md, borderRadius: radii.lg, paddingVertical: spacing.xs },
  hint: { textAlign: 'center', opacity: 0.6, marginTop: spacing.sm },
});
