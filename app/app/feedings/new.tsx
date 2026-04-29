import { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';

import { ActiveFeedingCard } from '@/components/ActiveFeedingCard';
import { AppTextInput } from '@/components/AppTextInput';
import { ChoiceTile } from '@/components/ChoiceTile';
import { FormScreen } from '@/components/FormScreen';
import { FormError } from '@/components/FormError';
import { radii, spacing } from '@/constants';
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
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'uk' ? uk : enUS;
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

      <Text
        variant="labelSmall"
        style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}
      >
        {t('common.type')}
      </Text>
      <View style={styles.kindGrid}>
        {FEEDING_KINDS.map((k) => (
          <View key={k} style={styles.kindCell}>
            <ChoiceTile
              icon={feedingKindIcon(k)}
              label={t(feedingKindKey(k))}
              tint={theme.colors.primary}
              selected={kind === k}
              onPress={() => setKind(k)}
            />
          </View>
        ))}
      </View>

      {isBreast && !activeFeeding ? (
        <Button
          mode="contained"
          icon="play-circle-outline"
          onPress={onStartTimer}
          loading={startFeeding.isPending}
          disabled={startFeeding.isPending}
          contentStyle={styles.submitContent}
          style={styles.startButton}
        >
          {t('feedings.new.startNow')}
        </Button>
      ) : null}

      {isBreast ? (
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.outlineVariant }]} />
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('feedings.new.orLogPast')}
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: theme.colors.outlineVariant }]} />
        </View>
      ) : null}

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
        label={t('feedings.new.notesLabel')}
        placeholder={t('feedings.new.notesPlaceholder')}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={2}
      />

      <FormError error={error} />

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={createFeeding.isPending}
        disabled={!canSubmit}
        contentStyle={styles.submitContent}
        style={styles.submit}
      >
        {t('common.save')}
      </Button>

      <Text variant="bodySmall" style={styles.hint}>
        {t('feedings.new.startedAt', {
          time: format(startedAtPreview, 'd MMM, HH:mm', { locale: dateLocale }),
        })}
      </Text>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  kindGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  kindCell: { flexBasis: '31%', flexGrow: 1, flexDirection: 'row' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  submit: { marginTop: spacing.md, borderRadius: radii.xl },
  submitContent: { paddingVertical: spacing.md },
  startButton: { borderRadius: radii.xl },
  hint: { textAlign: 'center', opacity: 0.6, marginTop: spacing.sm },
});
