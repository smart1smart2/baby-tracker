import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppTextInput } from '@/components/AppTextInput';
import { DateField } from '@/components/DateField';
import { FormError } from '@/components/FormError';
import { FormScreen } from '@/components/FormScreen';
import { FormSubmitButton } from '@/components/FormSubmitButton';
import { spacing } from '@/constants';
import { vaccineGroupKey } from '@/features/vaccinations/labels';
import {
  useChildVaccinations,
  useMarkVaccination,
  useUnmarkVaccination,
  useUpdateVaccination,
  useVaccinationTemplates,
} from '@/features/vaccinations/queries';
import { translateError, type FriendlyError } from '@/features/errors/translate';
import { useActiveChild } from '@/stores/activeChild';

export default function VaccinationDetailScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const activeChildId = useActiveChild((s) => s.activeChildId);

  const { data: templates = [] } = useVaccinationTemplates();
  const { data: marks = [] } = useChildVaccinations(activeChildId);
  const markVaccination = useMarkVaccination();
  const updateVaccination = useUpdateVaccination();
  const unmarkVaccination = useUnmarkVaccination();

  const template = useMemo(
    () => templates.find((tpl) => tpl.code === code) ?? null,
    [templates, code],
  );
  const existing = useMemo(
    () => (template ? marks.find((m) => m.vaccine_code === template.code) ?? null : null),
    [marks, template],
  );

  const [date, setDate] = useState<Date>(() => new Date());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<FriendlyError | null>(null);

  useEffect(() => {
    if (existing?.administered_at) setDate(new Date(existing.administered_at));
    setNotes(existing?.notes ?? '');
  }, [existing?.id, existing?.administered_at, existing?.notes]);

  if (!template) {
    return (
      <FormScreen>
        <ActivityIndicator />
      </FormScreen>
    );
  }
  if (!activeChildId) {
    return (
      <FormScreen>
        <Text style={{ color: theme.colors.onBackground }}>
          {t('vaccinations.empty.noChild')}
        </Text>
      </FormScreen>
    );
  }

  const groupName = t(vaccineGroupKey(template.group_code), { defaultValue: template.name });
  const submitting =
    markVaccination.isPending || updateVaccination.isPending || unmarkVaccination.isPending;

  const onSubmit = async () => {
    setError(null);
    const administeredAt = date.toISOString().slice(0, 10);
    try {
      if (existing) {
        await updateVaccination.mutateAsync({
          id: existing.id,
          childId: activeChildId,
          patch: { administered_at: administeredAt, notes: notes.trim() || null },
        });
      } else {
        await markVaccination.mutateAsync({
          childId: activeChildId,
          template,
          administeredAt,
          notes: notes.trim() || null,
        });
      }
      router.back();
    } catch (err) {
      setError(translateError(err));
    }
  };

  const onUnmark = async () => {
    if (!existing) return;
    setError(null);
    try {
      await unmarkVaccination.mutateAsync({ id: existing.id, childId: activeChildId });
      router.back();
    } catch (err) {
      setError(translateError(err));
    }
  };

  return (
    <FormScreen>
      <Text variant="titleLarge" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
        {groupName}
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {t('vaccinations.dose', { n: template.dose_number })}
      </Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {t('vaccinations.expectedRange', {
          min: template.expected_age_min_months,
          max: template.expected_age_max_months,
        })}
      </Text>

      <View style={{ height: spacing.lg }} />

      <DateField
        label={t('vaccinations.detail.administeredLabel')}
        value={date}
        onChange={setDate}
        maximumDate={new Date()}
      />

      <AppTextInput
        label={t('vaccinations.detail.notesLabel')}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      <FormError error={error} />

      <FormSubmitButton onPress={onSubmit} loading={submitting} disabled={submitting}>
        {existing ? t('common.save') : t('vaccinations.detail.markGiven')}
      </FormSubmitButton>

      {existing ? (
        <Button
          mode="text"
          textColor={theme.colors.error}
          onPress={onUnmark}
          disabled={submitting}
        >
          {t('vaccinations.detail.unmark')}
        </Button>
      ) : null}
    </FormScreen>
  );
}
