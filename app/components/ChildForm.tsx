import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { AppTextInput } from './AppTextInput';
import { AvatarPicker, type LocalPhoto } from './AvatarPicker';
import { FormScreen } from './FormScreen';
import { FormError } from './FormError';
import { FormSubmitButton } from './FormSubmitButton';
import { ChoiceTile } from './ChoiceTile';
import { DateField } from './DateField';
import { palette, spacing } from '@/constants';
import { useCreateChild, useUpdateChild } from '@/features/children/queries';
import { uploadChildAvatar } from '@/features/children/avatar';
import { translateError, type FriendlyError } from '@/features/errors/translate';
import { useActiveChild } from '@/stores/activeChild';
import type { Child, Sex } from '@/types/domain';

type SelectableSex = Extract<Sex, 'female' | 'male'>;

const SEX_OPTIONS: {
  value: SelectableSex;
  icon: 'gender-female' | 'gender-male';
  tint: string;
  labelKey: string;
}[] = [
  { value: 'female', icon: 'gender-female', tint: palette.secondary[400], labelKey: 'children.new.sexFemale' },
  { value: 'male', icon: 'gender-male', tint: palette.primary[500], labelKey: 'children.new.sexMale' },
];

type Props = {
  /** When provided, the form runs in edit mode pre-filled from this child. */
  initial?: Child;
  onClose: () => void;
};

/**
 * Shared create/edit form for a Child. Pre-fills fields when `initial` is given,
 * otherwise creates a new record. Avatar replace/removal is delegated to
 * AvatarPicker; we just track the pending photo and removal flag.
 */
export function ChildForm({ initial, onClose }: Props) {
  const { t } = useTranslation();
  const createChild = useCreateChild();
  const updateChild = useUpdateChild();
  const setActiveChildId = useActiveChild((s) => s.setActiveChildId);

  const isEdit = Boolean(initial);

  const [fullName, setFullName] = useState(initial?.full_name ?? '');
  const [dob, setDob] = useState<Date | null>(
    initial?.date_of_birth ? new Date(initial.date_of_birth) : null,
  );
  const [sex, setSex] = useState<SelectableSex | null>(
    initial?.sex === 'female' || initial?.sex === 'male' ? initial.sex : null,
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [pendingPhoto, setPendingPhoto] = useState<LocalPhoto | null>(null);
  const [removeExistingPhoto, setRemoveExistingPhoto] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);
  const [busy, setBusy] = useState(false);

  const displayUri = pendingPhoto?.uri
    ?? (removeExistingPhoto ? null : initial?.avatar_url ?? null);

  const canSubmit =
    fullName.trim().length > 0 && dob !== null && sex !== null && !busy;

  const onSubmit = async () => {
    if (!canSubmit || !dob || !sex) return;
    setError(null);
    setBusy(true);
    try {
      const fields = {
        full_name: fullName.trim(),
        date_of_birth: dob.toISOString().slice(0, 10),
        sex,
        notes: notes.trim() || null,
      };

      let target: Child;
      if (initial) {
        target = await updateChild.mutateAsync({ id: initial.id, patch: fields });
      } else {
        target = await createChild.mutateAsync(fields);
        setActiveChildId(target.id);
      }

      if (pendingPhoto) {
        const url = await uploadChildAvatar(
          target.id,
          pendingPhoto.uri,
          pendingPhoto.mimeType,
        );
        await updateChild.mutateAsync({ id: target.id, patch: { avatar_url: url } });
      } else if (isEdit && removeExistingPhoto && initial?.avatar_url) {
        await updateChild.mutateAsync({ id: target.id, patch: { avatar_url: null } });
      }

      onClose();
    } catch (err) {
      setError(translateError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Portal.Host>
      <FormScreen onClose={onClose}>
        <AvatarPicker
          displayUri={displayUri}
          onPickPhoto={(photo) => {
            setPendingPhoto(photo);
            setRemoveExistingPhoto(false);
          }}
          onRemovePhoto={() => {
            setPendingPhoto(null);
            setRemoveExistingPhoto(true);
          }}
        />

        <AppTextInput
          label={t('children.new.nameLabel')}
          value={fullName}
          onChangeText={setFullName}
          autoFocus={!isEdit}
          leftIcon="account-outline"
        />

        <DateField
          label={t('children.new.dobLabel')}
          value={dob}
          placeholder={t('children.new.dobPlaceholder')}
          onChange={setDob}
          maximumDate={new Date()}
        />

        <View style={styles.sexRow}>
          {SEX_OPTIONS.map((option) => (
            <ChoiceTile
              key={option.value}
              icon={option.icon}
              label={t(option.labelKey)}
              tint={option.tint}
              selected={sex === option.value}
              onPress={() => setSex(option.value)}
            />
          ))}
        </View>

        <AppTextInput
          label={t('children.new.notesLabel')}
          placeholder={t('children.new.notesPlaceholder')}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          leftIcon="note-outline"
        />

        <FormError error={error} />

        <FormSubmitButton
          onPress={onSubmit}
          loading={busy}
          disabled={!canSubmit}
          style={styles.submit}
        >
          {t('common.save')}
        </FormSubmitButton>
      </FormScreen>
    </Portal.Host>
  );
}

const styles = StyleSheet.create({
  sexRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  submit: { marginTop: spacing.lg },
});
