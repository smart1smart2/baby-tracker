import { useState } from 'react';
import { Image, View, StyleSheet, Pressable } from 'react-native';
import { Menu, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { iconSizes, palette, radii, shadows, spacing } from '@/constants';

import { useConfirm } from './ConfirmDialog';

const AVATAR_SIZE = 120;

export type LocalPhoto = { uri: string; mimeType: string };

type Props = {
  /** Currently displayed image — local picked uri or remote avatar_url. */
  displayUri: string | null;
  /** Called with the picked photo when the user takes/chooses one. */
  onPickPhoto: (photo: LocalPhoto) => void;
  /** Called when the user removes the existing photo. */
  onRemovePhoto: () => void;
};

/**
 * Circular avatar with a camera badge that opens a menu to take a photo,
 * pick from library, or remove. Encapsulates permission flow and image
 * picker so the parent only needs to store the resulting LocalPhoto.
 */
export function AvatarPicker({ displayUri, onPickPhoto, onRemovePhoto }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const hasPhoto = displayUri !== null;

  const pick = async (mode: 'camera' | 'library') => {
    closeMenu();
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

    const launch =
      mode === 'camera'
        ? ImagePicker.launchCameraAsync
        : ImagePicker.launchImageLibraryAsync;
    const result = await launch({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    onPickPhoto({ uri: asset.uri, mimeType: asset.mimeType ?? 'image/jpeg' });
  };

  const remove = () => {
    closeMenu();
    onRemovePhoto();
  };

  return (
    <View style={styles.block}>
      <Menu
        visible={menuOpen}
        onDismiss={closeMenu}
        anchor={
          <Pressable onPress={() => setMenuOpen(true)} style={styles.pressable}>
            {displayUri ? (
              <Image source={{ uri: displayUri }} style={styles.image} />
            ) : (
              <View
                style={[
                  styles.placeholder,
                  { backgroundColor: theme.colors.primaryContainer },
                ]}
              >
                <MaterialCommunityIcons
                  name="baby-face-outline"
                  size={iconSizes.xxl + 16}
                  color={theme.colors.primary}
                />
              </View>
            )}
            <View
              style={[
                styles.badge,
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
          onPress={() => pick('camera')}
        />
        <Menu.Item
          leadingIcon="image-outline"
          title={t('children.new.chooseFromLibrary')}
          onPress={() => pick('library')}
        />
        {hasPhoto ? (
          <Menu.Item
            leadingIcon="trash-can-outline"
            title={t('children.new.removePhoto')}
            titleStyle={{ color: palette.error }}
            onPress={remove}
          />
        ) : null}
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  pressable: { width: AVATAR_SIZE, height: AVATAR_SIZE },
  image: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radii.pill,
  },
  placeholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
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
  menu: {
    borderRadius: radii.lg,
    marginTop: -(spacing.xxxxl + spacing.xl),
    marginLeft: spacing.xxxl,
  },
});
