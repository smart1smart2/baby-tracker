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
import {
  normalizeCategory,
  templateKey,
} from '@/features/milestones/labels';
import {
  useChildMilestones,
  useMarkMilestone,
  useMilestoneTemplates,
  useUnmarkMilestone,
  useUpdateMilestone,
} from '@/features/milestones/queries';
import { translateError, type FriendlyError } from '@/features/errors/translate';
import { useActiveChild } from '@/stores/activeChild';

export default function MilestoneDetailScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const activeChildId = useActiveChild((s) => s.activeChildId);

  const { data: templates = [] } = useMilestoneTemplates();
  const { data: marks = [] } = useChildMilestones(activeChildId);
  const markMilestone = useMarkMilestone();
  const updateMilestone = useUpdateMilestone();
  const unmarkMilestone = useUnmarkMilestone();

  const template = useMemo(
    () => templates.find((tpl) => tpl.code === code) ?? null,
    [templates, code],
  );
  const existing = useMemo(
    () => (template ? marks.find((m) => m.template_id === template.id) ?? null : null),
    [marks, template],
  );

  const [date, setDate] = useState<Date>(() => new Date());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<FriendlyError | null>(null);

  useEffect(() => {
    if (existing?.achieved_at) setDate(new Date(existing.achieved_at));
    setNotes(existing?.notes ?? '');
  }, [existing?.id, existing?.achieved_at, existing?.notes]);

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
          {t('milestones.empty.noChild')}
        </Text>
      </FormScreen>
    );
  }

  const category = normalizeCategory(template.category);
  const title = t(templateKey(template.code, 'title'), { defaultValue: template.title });
  const description = t(templateKey(template.code, 'description'), {
    defaultValue: template.description ?? '',
  });
  const submitting =
    markMilestone.isPending || updateMilestone.isPending || unmarkMilestone.isPending;

  const onSubmit = async () => {
    setError(null);
    const achievedAt = date.toISOString().slice(0, 10);
    try {
      if (existing) {
        await updateMilestone.mutateAsync({
          id: existing.id,
          childId: activeChildId,
          patch: { achieved_at: achievedAt, notes: notes.trim() || null },
        });
      } else {
        await markMilestone.mutateAsync({
          childId: activeChildId,
          templateId: template.id,
          achievedAt,
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
      await unmarkMilestone.mutateAsync({ id: existing.id, childId: activeChildId });
      router.back();
    } catch (err) {
      setError(translateError(err));
    }
  };

  return (
    <FormScreen>
      <Text variant="titleLarge" style={{ color: theme.colors.onBackground, fontWeight: '700' }}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
        {description}
      </Text>
      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
        {t('milestones.expectedRange', {
          min: template.expected_age_min_months,
          max: template.expected_age_max_months,
        })}
        {' · '}
        {t(`milestones.category.${category}`)}
      </Text>

      <View style={{ height: spacing.lg }} />

      <DateField
        label={t('milestones.detail.dateLabel')}
        value={date}
        onChange={setDate}
        maximumDate={new Date()}
      />

      <AppTextInput
        label={t('milestones.detail.notesLabel')}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
      />

      <FormError error={error} />

      <FormSubmitButton onPress={onSubmit} loading={submitting} disabled={submitting}>
        {existing ? t('common.save') : t('milestones.detail.markAchieved')}
      </FormSubmitButton>

      {existing ? (
        <Button
          mode="text"
          textColor={theme.colors.error}
          onPress={onUnmark}
          disabled={submitting}
        >
          {t('milestones.detail.unmark')}
        </Button>
      ) : null}
    </FormScreen>
  );
}
