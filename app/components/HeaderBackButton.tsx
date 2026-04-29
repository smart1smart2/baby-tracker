import { StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';

import { iconSizes, spacing } from '@/constants';

/**
 * Header back button styled to match the FormScreen close (X) button —
 * same IconButton chrome and sizing — so navigation chrome is consistent
 * across stack screens and modal forms.
 */
export function HeaderBackButton() {
  const router = useRouter();
  return (
    <IconButton
      icon="arrow-left"
      size={iconSizes.lg}
      onPress={() => router.back()}
      style={styles.button}
    />
  );
}

const styles = StyleSheet.create({
  button: { marginTop: spacing.xs, marginLeft: -spacing.xs },
});
