import { StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { iconSizes, spacing } from '@/constants';

/**
 * Header close (X) button rendered in the top-right of every full-screen
 * modal so dismiss feels the same everywhere.
 */
export function ModalCloseButton() {
  const router = useRouter();
  return (
    <IconButton
      icon="close"
      size={iconSizes.lg}
      onPress={() => router.back()}
      style={styles.button}
    />
  );
}

const styles = StyleSheet.create({
  button: { marginTop: spacing.xs, marginRight: -spacing.xs },
});
