import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppTextInput } from '@/components/AppTextInput';
import { DateField } from '@/components/DateField';
import { FormError } from '@/components/FormError';
import { FormScreen } from '@/components/FormScreen';
import { FormSubmitButton } from '@/components/FormSubmitButton';
import { KindGrid } from '@/components/KindGrid';
import { SectionLabel } from '@/components/SectionLabel';
import { spacing } from '@/constants';
import { useCreateMeasurement } from '@/features/measurements/queries';
import {
  MEASUREMENT_KINDS,
  defaultUnit,
  measurementKindIcon,
  measurementKindKey,
} from '@/features/measurements/labels';
import { translateError, type FriendlyError } from '@/features/errors/translate';
import { useActiveChild } from '@/stores/activeChild';
import type { MeasurementKind } from '@/types/domain';

export default function NewMeasurementScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const activeChildId = useActiveChild((s) => s.activeChildId);
  const createMeasurement = useCreateMeasurement();

  const [kind, setKind] = useState<MeasurementKind>('weight');
  const [valueText, setValueText] = useState('');
  const [measuredAt, setMeasuredAt] = useState<Date>(() => new Date());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<FriendlyError | null>(null);

  const numericValue = Number(valueText.replace(',', '.'));
  const valid =
    valueText.length > 0 && Number.isFinite(numericValue) && numericValue > 0;

  const onSubmit = async () => {
    if (!activeChildId) {
      setError({ messageKey: 'measurements.new.chooseChildFirst' });
      return;
    }
    if (!valid) {
      setError({ messageKey: 'measurements.new.invalidValue' });
      return;
    }
    setError(null);
    try {
      await createMeasurement.mutateAsync({
        child_id: activeChildId,
        kind,
        value: numericValue,
        unit: defaultUnit(kind),
        measured_at: measuredAt.toISOString(),
        notes: notes.trim() || null,
      });
      router.back();
    } catch (err) {
      setError(translateError(err));
    }
  };

  return (
    <FormScreen onClose={() => router.back()}>
      <SectionLabel>{t('common.type')}</SectionLabel>
      <KindGrid
        value={kind}
        onChange={setKind}
        items={MEASUREMENT_KINDS.map((k) => ({
          value: k,
          icon: measurementKindIcon(k),
          label: t(measurementKindKey(k)),
        }))}
      />

      <AppTextInput
        label={t('measurements.new.valueLabel', { unit: defaultUnit(kind) })}
        value={valueText}
        onChangeText={setValueText}
        keyboardType="decimal-pad"
        placeholder={t('measurements.new.valuePlaceholder')}
        error={Boolean(error?.messageKey === 'measurements.new.invalidValue')}
      />

      <DateField
        label={t('measurements.new.measuredAtLabel')}
        value={measuredAt}
        onChange={setMeasuredAt}
        mode="datetime"
        maximumDate={new Date()}
      />

      <AppTextInput
        label={t('measurements.new.notesLabel')}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={2}
      />

      <FormError error={error} />

      <FormSubmitButton
        onPress={onSubmit}
        loading={createMeasurement.isPending}
        disabled={createMeasurement.isPending || !valid}
        style={styles.submit}
      >
        {t('common.save')}
      </FormSubmitButton>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  submit: { marginTop: spacing.lg },
});
