import { useState } from 'react';
import { Image, View, StyleSheet, Pressable } from 'react-native';
import { Avatar, Button, IconButton, Menu, Portal, TextInput, Text, useTheme } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { FormScreen } from '@/components/FormScreen';
import { FormError } from '@/components/FormError';
import { ChoiceTile } from '@/components/ChoiceTile';
import { DateField } from '@/components/DateField';
import { useConfirm } from '@/components/ConfirmDialog';
import { iconSizes, palette, radii, shadows, spacing } from '@/constants';
import { useCreateChild, useUpdateChild } from '@/features/children/queries';
import { uploadChildAvatar } from '@/features/children/avatar';
import { translateError, type FriendlyError } from '@/features/errors/translate';
import { useActiveChild } from '@/stores/activeChild';
import type { Sex } from '@/types/domain';

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

export default function NewChildScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const confirm = useConfirm();
  const createChild = useCreateChild();
  const updateChild = useUpdateChild();
  const setActiveChildId = useActiveChild((s) => s.setActiveChildId);

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [sex, setSex] = useState<SelectableSex | null>(null);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<LocalPhoto | null>(null);
  const [error, setError] = useState<FriendlyError | null>(null);
  const [busy, setBusy] = useState(false);
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);

  const canSubmit = fullName.trim().length > 0 && dob !== null && sex !== null && !busy;

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
    setPhoto({ uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' });
  };

  const closeMenu = () => setPhotoMenuOpen(false);
  const handleMenuChoice = async (choice: 'camera' | 'library' | 'remove') => {
    closeMenu();
    if (choice === 'camera' || choice === 'library') {
      await pickImage(choice);
    } else {
      setPhoto(null);
    }
  };

  const onSubmit = async () => {
    if (!canSubmit || !dob || !sex) return;
    setError(null);
    setBusy(true);
    try {
      const child = await createChild.mutateAsync({
        full_name: fullName.trim(),
        date_of_birth: dob.toISOString().slice(0, 10),
        sex,
        notes: notes.trim() || null,
      });

      if (photo) {
        const publicUrl = await uploadChildAvatar(child.id, photo.uri, photo.mimeType);
        await updateChild.mutateAsync({ id: child.id, patch: { avatar_url: publicUrl } });
      }

      setActiveChildId(child.id);
      router.back();
    } catch (err) {
      setError(translateError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Portal.Host>
    <Stack.Screen
      options={{
        headerLeft: () => null,
        headerRight: () => (
          <IconButton
            icon="close"
            size={iconSizes.lg}
            onPress={() => router.back()}
            style={{ marginTop: spacing.xs }}
          />
        ),
      }}
    />
    <FormScreen>
      <View style={styles.avatarBlock}>
        <Menu
          visible={photoMenuOpen}
          onDismiss={closeMenu}
          anchor={
            <Pressable
              onPress={() => setPhotoMenuOpen(true)}
              style={styles.avatarPressable}
            >
              {photo ? (
                <Image source={{ uri: photo.uri }} style={styles.avatarImage} />
              ) : (
                <Avatar.Icon
                  size={iconSizes.brand + 24}
                  icon="baby-face-outline"
                  style={{ backgroundColor: theme.colors.primaryContainer }}
                  color={theme.colors.primary}
                />
              )}
              <View
                style={[
                  styles.cameraBadge,
                  shadows.sm,
                  { backgroundColor: theme.colors.primary, borderColor: theme.colors.surface },
                ]}
              >
                <MaterialCommunityIcons
                  name={photo ? 'pencil' : 'camera-plus-outline'}
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
          {photo ? (
            <Menu.Item
              leadingIcon="trash-can-outline"
              title={t('children.new.removePhoto')}
              titleStyle={{ color: palette.error }}
              onPress={() => handleMenuChoice('remove')}
            />
          ) : null}
        </Menu>
      </View>

      <TextInput
        label={t('children.new.nameLabel')}
        value={fullName}
        onChangeText={setFullName}
        mode="outlined"
        autoFocus
        left={<TextInput.Icon icon="account-outline" />}
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

      <TextInput
        label={t('children.new.notesLabel')}
        value={notes}
        onChangeText={setNotes}
        mode="outlined"
        multiline
        numberOfLines={3}
        left={<TextInput.Icon icon="note-outline" />}
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
        {busy ? t('children.new.uploadingPhoto') : t('common.save')}
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
