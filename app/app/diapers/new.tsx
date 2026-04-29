import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AppTextInput } from '@/components/AppTextInput';
import { DateField } from '@/components/DateField';
import { FormError } from '@/components/FormError';
import { FormScreen } from '@/components/FormScreen';
import { KindGrid } from '@/components/KindGrid';
import { radii, spacing } from '@/constants';
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
      <Text
        variant="labelSmall"
        style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}
      >
        {t('common.type')}
      </Text>
      <KindGrid
        columns={2}
        value={kind}
        onChange={setKind}
        items={DIAPER_KINDS.map((k) => ({
          value: k,
          icon: diaperKindIcon(k),
          label: t(diaperKindKey(k)),
        }))}
      />

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
  sectionLabel: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  submit: { marginTop: spacing.lg, borderRadius: radii.xl },
  submitContent: { paddingVertical: spacing.md },
});
