import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, HelperText, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { FormScreen } from '@/components/FormScreen';
import { FormError } from '@/components/FormError';
import { radii, spacing } from '@/constants';
import { useCreateChild } from '@/features/children/queries';
import { translateError, type FriendlyError } from '@/features/errors/translate';
import { useActiveChild } from '@/stores/activeChild';
import type { Sex } from '@/types/domain';

const isValidDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));

export default function NewChildScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const createChild = useCreateChild();
  const setActiveChildId = useActiveChild((s) => s.setActiveChildId);

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState<Sex>('unspecified');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<FriendlyError | null>(null);

  const dobValid = dob === '' || isValidDate(dob);
  const canSubmit =
    fullName.trim().length > 0 && isValidDate(dob) && !createChild.isPending;

  const onSubmit = async () => {
    setError(null);
    try {
      const child = await createChild.mutateAsync({
        full_name: fullName.trim(),
        date_of_birth: dob,
        sex,
        notes: notes.trim() || null,
      });
      setActiveChildId(child.id);
      router.back();
    } catch (err) {
      setError(translateError(err));
    }
  };

  return (
    <FormScreen>
      <TextInput
        label={t('children.new.nameLabel')}
        value={fullName}
        onChangeText={setFullName}
        mode="outlined"
        autoFocus
      />

      <TextInput
        label={t('children.new.dobLabel')}
        value={dob}
        onChangeText={setDob}
        mode="outlined"
        placeholder={t('children.new.dobPlaceholder')}
        keyboardType="numbers-and-punctuation"
        autoCapitalize="none"
      />
      {!dobValid ? <HelperText type="error">{t('children.new.dobInvalid')}</HelperText> : null}

      <View style={styles.section}>
        <Text variant="labelLarge">{t('children.new.sexLabel')}</Text>
        <SegmentedButtons
          value={sex}
          onValueChange={(v) => setSex(v as Sex)}
          buttons={[
            { value: 'female', label: t('children.new.sexFemale') },
            { value: 'male', label: t('children.new.sexMale') },
            { value: 'unspecified', label: t('children.new.sexUnspecified') },
          ]}
        />
      </View>

      <TextInput
        label={t('children.new.notesLabel')}
        value={notes}
        onChangeText={setNotes}
        mode="outlined"
        multiline
        numberOfLines={3}
      />

      <FormError error={error} />

      <Button
        mode="contained"
        onPress={onSubmit}
        loading={createChild.isPending}
        disabled={!canSubmit}
        style={styles.submit}
      >
        {t('common.save')}
      </Button>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm, marginTop: spacing.xs },
  submit: { marginTop: spacing.md, borderRadius: radii.lg, paddingVertical: spacing.xs },
});
