import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppTextInput } from '@/components/AppTextInput';
import { DateField } from '@/components/DateField';
import { FormError } from '@/components/FormError';
import { FormScreen } from '@/components/FormScreen';
import { iconSizes, radii, spacing } from '@/constants';
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
  const theme = useTheme();
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
      <View style={styles.kindRow}>
        {MEASUREMENT_KINDS.map((k) => {
          const isActive = kind === k;
          return (
            <Pressable
              key={k}
              onPress={() => setKind(k)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={({ pressed }) => [
                styles.kindTile,
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
              <MaterialCommunityIcons
                name={measurementKindIcon(k)}
                size={iconSizes.xl}
                color={isActive ? theme.colors.onPrimary : theme.colors.primary}
              />
              <Text
                variant="labelLarge"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                style={{
                  color: isActive ? theme.colors.onPrimary : theme.colors.onSurface,
                  fontWeight: '600',
                }}
              >
                {t(measurementKindKey(k))}
              </Text>
            </Pressable>
          );
        })}
      </View>

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

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={createMeasurement.isPending}
        disabled={createMeasurement.isPending || !valid}
        contentStyle={styles.submitContent}
        style={styles.submit}
      >
        {t('common.save')}
      </Button>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  kindRow: { flexDirection: 'row', gap: spacing.sm },
  kindTile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    minHeight: 96,
  },
  submit: { marginTop: spacing.lg, borderRadius: radii.xl },
  submitContent: { paddingVertical: spacing.md },
});
