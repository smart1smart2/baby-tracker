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
import { useCreateDiaper } from '@/features/diapers/queries';
import {
  DIAPER_KINDS,
  diaperKindIcon,
  diaperKindKey,
} from '@/features/diapers/labels';
import { translateError, type FriendlyError } from '@/features/errors/translate';
import { useActiveChild } from '@/stores/activeChild';
import type { DiaperKind } from '@/types/domain';

export default function NewDiaperScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const activeChildId = useActiveChild((s) => s.activeChildId);
  const createDiaper = useCreateDiaper();

  const [kind, setKind] = useState<DiaperKind>('wet');
  const [occurredAt, setOccurredAt] = useState<Date>(() => new Date());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<FriendlyError | null>(null);

  const onSubmit = async () => {
    if (!activeChildId) {
      setError({ messageKey: 'diapers.new.chooseChildFirst' });
      return;
    }
    setError(null);
    try {
      await createDiaper.mutateAsync({
        child_id: activeChildId,
        kind,
        occurred_at: occurredAt.toISOString(),
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
        {DIAPER_KINDS.map((k) => {
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
                name={diaperKindIcon(k)}
                size={iconSizes.xl}
                color={isActive ? theme.colors.onPrimary : theme.colors.primary}
              />
              <Text
                variant="labelLarge"
                style={{
                  color: isActive ? theme.colors.onPrimary : theme.colors.onSurface,
                  fontWeight: '600',
                }}
              >
                {t(diaperKindKey(k))}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <DateField
        label={t('diapers.new.occurredAtLabel')}
        value={occurredAt}
        onChange={setOccurredAt}
        mode="datetime"
        maximumDate={new Date()}
      />

      <AppTextInput
        label={t('diapers.new.notesLabel')}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={2}
      />

      <FormError error={error} />

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={createDiaper.isPending}
        disabled={createDiaper.isPending}
        contentStyle={styles.submitContent}
        style={styles.submit}
      >
        {t('common.save')}
      </Button>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  kindRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  kindTile: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    minHeight: 56,
  },
  submit: { marginTop: spacing.lg, borderRadius: radii.xl },
  submitContent: { paddingVertical: spacing.md },
});
