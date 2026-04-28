import { useState } from 'react';
import { Image, View, StyleSheet, Pressable } from 'react-native';
import { Avatar, Button, Menu, Portal, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { AppTextInput } from './AppTextInput';
import { FormScreen } from './FormScreen';
import { FormError } from './FormError';
import { ChoiceTile } from './ChoiceTile';
import { DateField } from './DateField';
import { useConfirm } from './ConfirmDialog';
import { iconSizes, palette, radii, shadows, spacing } from '@/constants';
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

type LocalPhoto = { uri: string; mimeType: string };

type Props = {
  /** When provided, the form runs in edit mode pre-filled from this child. */
  initial?: Child;
  onClose: () => void;
};

/**
 * Shared create/edit form for a Child. Pre-fills fields when `initial` is given,
 * otherwise creates a new record. Handles avatar replace and removal — for edit
 * mode the new photo is uploaded after the row update, or `avatar_url` is
 * cleared if the user removed the existing one.
 */
export function ChildForm({ initial, onClose }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const confirm = useConfirm();
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
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);

  const displayUri = pendingPhoto?.uri
    ?? (removeExistingPhoto ? null : initial?.avatar_url ?? null);
  const hasPhoto = displayUri !== null;

  const canSubmit =
    fullName.trim().length > 0 && dob !== null && sex !== null && !busy;

  const pickImage = async (mode: 'camera' | 'library') => {
    const permission =
      mode === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      await confirm({
        title: t('children.new.permissionDenied'),
        message: t('children.new.permissionDeniedMessage'),
        confirmLabel: t('common.confirm'),
        cancelLabel: t('common.cancel'),
      });
      return;
    }

    const result =
      mode === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setPendingPhoto({ uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' });
    setRemoveExistingPhoto(false);
  };

  const closeMenu = () => setPhotoMenuOpen(false);
  const handleMenuChoice = async (choice: 'camera' | 'library' | 'remove') => {
    closeMenu();
    if (choice === 'camera' || choice === 'library') {
      await pickImage(choice);
    } else {
      setPendingPhoto(null);
      setRemoveExistingPhoto(true);
    }
  };

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
        <View style={styles.avatarBlock}>
          <Menu
            visible={photoMenuOpen}
            onDismiss={closeMenu}
            anchor={
              <Pressable
                onPress={() => setPhotoMenuOpen(true)}
                style={styles.avatarPressable}
              >
                {displayUri ? (
                  <Image source={{ uri: displayUri }} style={styles.avatarImage} />
                ) : (
                  <Avatar.Icon
                    size={AVATAR_SIZE}
                    icon="baby-face-outline"
                    style={{ backgroundColor: theme.colors.primaryContainer }}
                    color={theme.colors.primary}
                  />
                )}
                <View
                  style={[
                    styles.cameraBadge,
                    shadows.sm,
                    {
                      backgroundColor: theme.colors.primary,
                      borderColor: theme.colors.surface,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={hasPhoto ? 'pencil' : 'camera-plus-outline'}
                    size={iconSizes.md}
                    color={theme.colors.onPrimary}
                  />
                </View>
              </Pressable>
            }
            anchorPosition="bottom"
            contentStyle={[styles.menu, { backgroundColor: theme.colors.surface }]}
          >
            <Menu.Item
              leadingIcon="camera-outline"
              title={t('children.new.takePhoto')}
              onPress={() => handleMenuChoice('camera')}
            />
            <Menu.Item
              leadingIcon="image-outline"
              title={t('children.new.chooseFromLibrary')}
              onPress={() => handleMenuChoice('library')}
            />
            {hasPhoto ? (
              <Menu.Item
                leadingIcon="trash-can-outline"
                title={t('children.new.removePhoto')}
                titleStyle={{ color: palette.error }}
                onPress={() => handleMenuChoice('remove')}
              />
            ) : null}
          </Menu>
        </View>

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

        <View style={styles.sexBlock}>
          <Text
            variant="labelLarge"
            style={[styles.sexLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            {t('children.new.sexLabel')}
          </Text>
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
        </View>

        <AppTextInput
          label={t('children.new.notesLabel')}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          leftIcon="note-outline"
        />

        <FormError error={error} />

        <Button
          mode="contained"
          onPress={onSubmit}
          loading={busy}
          disabled={!canSubmit}
          contentStyle={styles.submitContent}
          style={styles.submit}
        >
          {t('common.save')}
        </Button>
      </FormScreen>
    </Portal.Host>
  );
}

const AVATAR_SIZE = iconSizes.brand + 24;

const styles = StyleSheet.create({
  avatarBlock: {
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  avatarPressable: { width: AVATAR_SIZE, height: AVATAR_SIZE },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radii.pill,
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  sexBlock: { gap: spacing.sm, marginTop: spacing.xs },
  sexLabel: { marginLeft: spacing.xs },
  sexRow: { flexDirection: 'row', gap: spacing.sm },
  submit: { marginTop: spacing.lg, borderRadius: radii.lg },
  submitContent: { paddingVertical: spacing.sm },
  menu: {
    borderRadius: radii.lg,
    marginTop: -(spacing.xxxxl + spacing.xl),
    marginLeft: spacing.xxxl,
  },
});
