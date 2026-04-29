import { useMemo, useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';

import { AppTextInput } from '@/components/AppTextInput';
import { FormScreen } from '@/components/FormScreen';
import { FormError } from '@/components/FormError';
import { radii, spacing } from '@/constants';
import { useCreateFeeding } from '@/features/feedings/queries';
import { FEEDING_KINDS, feedingKindKey } from '@/features/feedings/labels';
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
    !createFeeding.isPending && (!isSolid || solidFood.trim().length > 0);

  const kindRows = useMemo(() => {
    const all = FEEDING_KINDS.map((k) => ({ value: k, label: t(feedingKindKey(k)) }));
    return [all.slice(0, 2), all.slice(2, 4), all.slice(4, 5)];
  }, [t]);

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

  return (
    <FormScreen onClose={() => router.back()}>
      <View style={styles.kindBlock}>
        {kindRows.map((row, idx) => (
          <View key={idx} style={styles.kindRow}>
            {row.map((opt) => {
              const isActive = opt.value === kind;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setKind(opt.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  style={({ pressed }) => [
                    styles.kindPill,
                    {
                      backgroundColor: isActive
                        ? theme.colors.primary
                        : theme.colors.surface,
                      borderColor: isActive
                        ? theme.colors.primary
                        : theme.colors.outlineVariant,
                      opacity: pressed ? 0.85 : 1,
                    },
                  ]}
                >
                  <Text
                    variant="labelLarge"
                    style={{
                      color: isActive ? theme.colors.onPrimary : theme.colors.onSurface,
                      fontWeight: '600',
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

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
  kindBlock: { gap: spacing.sm },
  kindRow: { flexDirection: 'row', gap: spacing.sm },
  kindPill: {
    flex: 1,
    minHeight: 52,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submit: { marginTop: spacing.md, borderRadius: radii.xl },
  submitContent: { paddingVertical: spacing.md },
  hint: { textAlign: 'center', opacity: 0.6, marginTop: spacing.sm },
});
