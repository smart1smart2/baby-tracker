import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, SegmentedButtons, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppTextInput } from '@/components/AppTextInput';
import { FormScreen } from '@/components/FormScreen';
import { FormError } from '@/components/FormError';
import { radii, spacing } from '@/constants';
import { useCreateFeeding } from '@/features/feedings/queries';
import { translateError, type FriendlyError } from '@/features/errors/translate';
import { useActiveChild } from '@/stores/activeChild';
import type { FeedingKind } from '@/types/domain';

const KINDS: FeedingKind[] = [
  'breast_left',
  'breast_right',
  'bottle_breast_milk',
  'bottle_formula',
  'solid',
];

const KIND_LABEL_KEYS: Record<FeedingKind, string> = {
  breast_left: 'feedings.kinds.breastLeft',
  breast_right: 'feedings.kinds.breastRight',
  bottle_breast_milk: 'feedings.kinds.bottleBreastMilk',
  bottle_formula: 'feedings.kinds.bottleFormula',
  solid: 'feedings.kinds.solid',
};

export default function NewFeedingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const activeChildId = useActiveChild((s) => s.activeChildId);
  const createFeeding = useCreateFeeding();

  const [kind, setKind] = useState<FeedingKind>('breast_left');
  const [durationMin, setDurationMin] = useState('');
  const [amountMl, setAmountMl] = useState('');
  const [solidFood, setSolidFood] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<FriendlyError | null>(null);

  const isBreast = kind === 'breast_left' || kind === 'breast_right';
  const isBottle = kind === 'bottle_breast_milk' || kind === 'bottle_formula';
  const isSolid = kind === 'solid';

  const kindButtons = useMemo(
    () => KINDS.map((k) => ({ value: k, label: t(KIND_LABEL_KEYS[k]) })),
    [t],
  );

  const onSubmit = async () => {
    if (!activeChildId) {
      setError({ messageKey: 'feedings.new.chooseChildFirst' });
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
      setError(translateError(err));
    }
  };

  return (
    <FormScreen onClose={() => router.back()}>
      <View style={styles.section}>
        <Text variant="labelLarge">{t('feedings.new.typeLabel')}</Text>
        <SegmentedButtons
          value={kind}
          onValueChange={(v) => setKind(v as FeedingKind)}
          buttons={kindButtons.slice(0, 2)}
        />
        <SegmentedButtons
          value={kind}
          onValueChange={(v) => setKind(v as FeedingKind)}
          buttons={kindButtons.slice(2, 4)}
        />
        <SegmentedButtons
          value={kind}
          onValueChange={(v) => setKind(v as FeedingKind)}
          buttons={[kindButtons[4]]}
        />
      </View>

      {isBreast ? (
        <AppTextInput
          label={t('feedings.new.durationLabel')}
          value={durationMin}
          onChangeText={setDurationMin}
          keyboardType="number-pad"
          placeholder={t('feedings.new.durationPlaceholder')}
          leftIcon="timer-outline"
        />
      ) : null}

      {isBottle ? (
        <AppTextInput
          label={t('feedings.new.amountLabel')}
          value={amountMl}
          onChangeText={setAmountMl}
          keyboardType="number-pad"
          placeholder={t('feedings.new.amountPlaceholder')}
          leftIcon="cup-outline"
        />
      ) : null}

      {isSolid ? (
        <AppTextInput
          label={t('feedings.new.solidLabel')}
          value={solidFood}
          onChangeText={setSolidFood}
          placeholder={t('feedings.new.solidPlaceholder')}
          leftIcon="food-apple-outline"
        />
      ) : null}

      <AppTextInput
        label={t('feedings.new.notesLabel')}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={2}
        leftIcon="note-outline"
      />

      <FormError error={error} />

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={createFeeding.isPending}
        disabled={createFeeding.isPending}
        style={styles.submit}
      >
        {t('common.save')}
      </Button>

      <Text variant="bodySmall" style={styles.hint}>
        {isBreast && durationMin
          ? t('feedings.new.timeHintWithDuration', { minutes: durationMin })
          : t('feedings.new.timeHint')}
      </Text>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  submit: { marginTop: spacing.md, borderRadius: radii.lg, paddingVertical: spacing.xs },
  hint: { textAlign: 'center', opacity: 0.6, marginTop: spacing.sm },
});
