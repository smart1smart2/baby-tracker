import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { ActiveFeedingCard } from '@/components/ActiveFeedingCard';
import { AppTextInput } from '@/components/AppTextInput';
import { FormScreen } from '@/components/FormScreen';
import { FormError } from '@/components/FormError';
import { FormSubmitButton } from '@/components/FormSubmitButton';
import { KindGrid } from '@/components/KindGrid';
import { LabeledDivider } from '@/components/LabeledDivider';
import { SectionLabel } from '@/components/SectionLabel';
import { spacing } from '@/constants';
import { useDateLocale } from '@/hooks/use-date-locale';
import {
  useActiveFeeding,
  useCreateFeeding,
  useStartFeeding,
} from '@/features/feedings/queries';
import {
  FEEDING_KINDS,
  feedingKindIcon,
  feedingKindKey,
} from '@/features/feedings/labels';
import { translateError, type FriendlyError } from '@/features/errors/translate';
import { useActiveChild } from '@/stores/activeChild';
import type { FeedingKind } from '@/types/domain';

export default function NewFeedingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const activeChildId = useActiveChild((s) => s.activeChildId);
  const createFeeding = useCreateFeeding();
  const startFeeding = useStartFeeding();
  const { data: activeFeeding } = useActiveFeeding(activeChildId);

  const [kind, setKind] = useState<FeedingKind>('breast_left');
  const [durationMin, setDurationMin] = useState('');
  const [amountMl, setAmountMl] = useState('');
  const [solidFood, setSolidFood] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<FriendlyError | null>(null);

  const isBreast = kind === 'breast_left' || kind === 'breast_right';
  const isBottle = kind === 'bottle_breast_milk' || kind === 'bottle_formula';
  const isSolid = kind === 'solid';

  const canSubmit =
    !createFeeding.isPending &&
    !activeFeeding &&
    (!isSolid || solidFood.trim().length > 0);

  const startedAtPreview = useMemo(() => {
    const now = new Date();
    if (isBreast && durationMin) {
      const mins = Number(durationMin);
      if (Number.isFinite(mins) && mins > 0) {
        const started = new Date(now);
        started.setMinutes(now.getMinutes() - mins);
        return started;
      }
    }
    return now;
  }, [isBreast, durationMin]);

  const onSubmit = async () => {
    if (!activeChildId) {
      setError({ messageKey: 'feedings.new.chooseChildFirst' });
      return;
    }
    if (!canSubmit) return;
    setError(null);

    const now = new Date();
    const startedAt = new Date(now);
    let endedAt: Date | null = null;

    if (isBreast && durationMin) {
      const mins = Number(durationMin);
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
        amount_ml:
          isBottle && amountMl && Number.isFinite(Number(amountMl))
            ? Number(amountMl)
            : null,
        solid_food: isSolid && solidFood.trim() ? solidFood.trim() : null,
        notes: notes.trim() || null,
      });
      router.back();
    } catch (err) {
      setError(translateError(err));
    }
  };

  const onStartTimer = async () => {
    if (!activeChildId || !isBreast) return;
    setError(null);
    try {
      await startFeeding.mutateAsync({ childId: activeChildId, kind });
      router.back();
    } catch (err) {
      setError(translateError(err));
    }
  };

  return (
    <FormScreen onClose={() => router.back()}>
      {activeFeeding ? <ActiveFeedingCard feeding={activeFeeding} /> : null}

      <SectionLabel>{t('common.type')}</SectionLabel>
      <KindGrid
        value={kind}
        onChange={setKind}
        items={FEEDING_KINDS.map((k) => ({
          value: k,
          icon: feedingKindIcon(k),
          label: t(feedingKindKey(k)),
        }))}
      />

      {isBreast && !activeFeeding ? (
        <FormSubmitButton
          icon="play-circle-outline"
          onPress={onStartTimer}
          loading={startFeeding.isPending}
          disabled={startFeeding.isPending}
        >
          {t('feedings.new.startNow')}
        </FormSubmitButton>
      ) : null}

      {isBreast ? <LabeledDivider>{t('feedings.new.orLogPast')}</LabeledDivider> : null}

      {isBreast ? (
        <AppTextInput
          label={t('feedings.new.durationLabel')}
          value={durationMin}
          onChangeText={setDurationMin}
          keyboardType="number-pad"
          placeholder={t('feedings.new.durationPlaceholder')}
        />
      ) : null}

      {isBottle ? (
        <AppTextInput
          label={t('feedings.new.amountLabel')}
          value={amountMl}
          onChangeText={setAmountMl}
          keyboardType="number-pad"
          placeholder={t('feedings.new.amountPlaceholder')}
        />
      ) : null}

      {isSolid ? (
        <AppTextInput
          label={t('feedings.new.solidLabel')}
          value={solidFood}
          onChangeText={setSolidFood}
          placeholder={t('feedings.new.solidPlaceholder')}
        />
      ) : null}

      <AppTextInput
        label={t(isSolid ? 'feedings.new.reactionLabel' : 'feedings.new.notesLabel')}
        placeholder={t(
          isSolid ? 'feedings.new.reactionPlaceholder' : 'feedings.new.notesPlaceholder',
        )}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={2}
      />

      <FormError error={error} />

      <FormSubmitButton
        onPress={onSubmit}
        loading={createFeeding.isPending}
        disabled={!canSubmit}
        style={styles.submit}
      >
        {t('common.save')}
      </FormSubmitButton>

      <Text variant="bodySmall" style={styles.hint}>
        {t('feedings.new.startedAt', {
          time: format(startedAtPreview, 'd MMM, HH:mm', { locale: dateLocale }),
        })}
      </Text>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  submit: { marginTop: spacing.md },
  hint: { textAlign: 'center', opacity: 0.6, marginTop: spacing.sm },
});
