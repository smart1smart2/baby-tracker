import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { differenceInMinutes, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';

import { AppTextInput } from '@/components/AppTextInput';
import { DateField } from '@/components/DateField';
import { FormError } from '@/components/FormError';
import { FormScreen } from '@/components/FormScreen';
import { iconSizes, palette, radii, shadows, spacing } from '@/constants';
import {
  useActiveSleep,
  useCreateSleep,
  useStartSleep,
  useStopSleep,
} from '@/features/sleeps/queries';
import { translateError, type FriendlyError } from '@/features/errors/translate';
import { useActiveChild } from '@/stores/activeChild';

export default function NewSleepScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'uk' ? uk : enUS;
  const activeChildId = useActiveChild((s) => s.activeChildId);

  const { data: activeSleep } = useActiveSleep(activeChildId);
  const startSleep = useStartSleep();
  const stopSleep = useStopSleep();
  const createSleep = useCreateSleep();

  const [startedAt, setStartedAt] = useState<Date>(() => {
    const d = new Date();
    d.setHours(d.getHours() - 1);
    return d;
  });
  const [endedAt, setEndedAt] = useState<Date>(() => new Date());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<FriendlyError | null>(null);

  // Tick once a minute so the active timer label updates.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!activeSleep) return;
    const id = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, [activeSleep]);

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

  const onStop = async () => {
    if (!activeSleep) return;
    setError(null);
    try {
      await stopSleep.mutateAsync(activeSleep.id);
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

  const activeSince = activeSleep
    ? formatDistanceToNowStrict(parseISO(activeSleep.started_at), {
        locale: dateLocale,
      })
    : null;

  return (
    <FormScreen onClose={() => router.back()}>
      {/* Active timer banner — drives sleep flow when one is in progress. */}
      {activeSleep ? (
        <View
          style={[
            styles.activeBanner,
            shadows.sm,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
          // tick is read so the banner re-renders every minute
          key={tick}
        >
          <MaterialCommunityIcons
            name="sleep"
            size={iconSizes.xl}
            color={theme.colors.primary}
          />
          <View style={styles.activeText}>
            <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
              {t('sleeps.new.activeSleep')}
            </Text>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
              {activeSince}
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={onStop}
            loading={stopSleep.isPending}
            disabled={stopSleep.isPending}
            buttonColor={palette.error}
            style={styles.actionButton}
          >
            {t('sleeps.new.stopNow')}
          </Button>
        </View>
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

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.outlineVariant }]} />
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {t('sleeps.new.manualSection')}
        </Text>
        <View style={[styles.dividerLine, { backgroundColor: theme.colors.outlineVariant }]} />
      </View>

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
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  activeText: { flex: 1, gap: 2 },
  actionButton: { borderRadius: radii.lg },
  startButton: { borderRadius: radii.xl },
  startContent: { paddingVertical: spacing.md },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  submit: { marginTop: spacing.md, borderRadius: radii.xl },
  submitContent: { paddingVertical: spacing.md },
  hint: { textAlign: 'center', marginTop: spacing.sm },
});
