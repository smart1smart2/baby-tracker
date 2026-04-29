import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { differenceInMinutes } from 'date-fns';

import { ActiveSleepCard } from '@/components/ActiveSleepCard';
import { AppTextInput } from '@/components/AppTextInput';
import { DateField } from '@/components/DateField';
import { FormError } from '@/components/FormError';
import { FormScreen } from '@/components/FormScreen';
import { LabeledDivider } from '@/components/LabeledDivider';
import { radii, spacing } from '@/constants';
import {
  useActiveSleep,
  useCreateSleep,
  useStartSleep,
} from '@/features/sleeps/queries';
import { translateError, type FriendlyError } from '@/features/errors/translate';
import { useActiveChild } from '@/stores/activeChild';

export default function NewSleepScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const activeChildId = useActiveChild((s) => s.activeChildId);

  const { data: activeSleep } = useActiveSleep(activeChildId);
  const startSleep = useStartSleep();
  const createSleep = useCreateSleep();

  const [startedAt, setStartedAt] = useState<Date>(() => {
    const d = new Date();
    d.setHours(d.getHours() - 1);
    return d;
  });
  const [endedAt, setEndedAt] = useState<Date>(() => new Date());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<FriendlyError | null>(null);

  const onStart = async () => {
    if (!activeChildId) {
      setError({ messageKey: 'sleeps.new.chooseChildFirst' });
      return;
    }
    setError(null);
    try {
      await startSleep.mutateAsync(activeChildId);
      router.back();
    } catch (err) {
      setError(translateError(err));
    }
  };

  const onManualSubmit = async () => {
    if (!activeChildId) {
      setError({ messageKey: 'sleeps.new.chooseChildFirst' });
      return;
    }
    if (endedAt <= startedAt) {
      setError({ messageKey: 'sleeps.new.endBeforeStart' });
      return;
    }
    setError(null);
    try {
      await createSleep.mutateAsync({
        child_id: activeChildId,
        started_at: startedAt.toISOString(),
        ended_at: endedAt.toISOString(),
        notes: notes.trim() || null,
      });
      router.back();
    } catch (err) {
      setError(translateError(err));
    }
  };

  return (
    <FormScreen onClose={() => router.back()}>
      {activeSleep ? (
        <ActiveSleepCard sleep={activeSleep} />
      ) : (
        <Button
          mode="contained"
          icon="play-circle-outline"
          onPress={onStart}
          loading={startSleep.isPending}
          disabled={startSleep.isPending}
          contentStyle={styles.startContent}
          style={styles.startButton}
        >
          {t('sleeps.new.startNow')}
        </Button>
      )}

      <LabeledDivider>{t('sleeps.new.manualSection')}</LabeledDivider>

      <DateField
        label={t('sleeps.new.startedAtLabel')}
        value={startedAt}
        onChange={setStartedAt}
        mode="datetime"
        maximumDate={new Date()}
      />

      <DateField
        label={t('sleeps.new.endedAtLabel')}
        value={endedAt}
        onChange={setEndedAt}
        mode="datetime"
        maximumDate={new Date()}
        minimumDate={startedAt}
      />

      <AppTextInput
        label={t('sleeps.new.notesLabel')}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={2}
      />

      <FormError error={error} />

      <Button
        mode="contained"
        onPress={onManualSubmit}
        loading={createSleep.isPending}
        disabled={createSleep.isPending || Boolean(activeSleep)}
        contentStyle={styles.submitContent}
        style={styles.submit}
      >
        {t('common.save')}
      </Button>

      <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
        {t('sleeps.new.durationHint', {
          minutes: Math.max(differenceInMinutes(endedAt, startedAt), 0),
        })}
      </Text>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  startButton: { borderRadius: radii.xl },
  startContent: { paddingVertical: spacing.md },
  submit: { marginTop: spacing.md, borderRadius: radii.xl },
  submitContent: { paddingVertical: spacing.md },
  hint: { textAlign: 'center', marginTop: spacing.sm },
});
