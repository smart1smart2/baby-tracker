import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { iconSizes, radii, spacing } from '@/constants';
import type { FriendlyError } from '@/features/errors/translate';

type Props = {
  error: FriendlyError | null;
  /** When true, renders compact inline (no card background). */
  inline?: boolean;
};

export function FormError({ error, inline = false }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  if (!error) return null;

  const message = t(error.messageKey, error.params);
  const hint = error.hintKey ? t(error.hintKey, error.params) : null;

  if (inline) {
    return (
      <View style={styles.inlineRow}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={iconSizes.sm}
          color={theme.colors.error}
        />
        <Text variant="bodySmall" style={[styles.inlineText, { color: theme.colors.error }]}>
          {message}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.errorContainer,
          borderColor: theme.colors.error,
        },
      ]}
    >
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={iconSizes.md}
        color={theme.colors.error}
      />
      <View style={styles.textBlock}>
        <Text
          variant="labelLarge"
          style={[styles.message, { color: theme.colors.onErrorContainer }]}
        >
          {message}
        </Text>
        {hint ? (
          <Text
            variant="bodySmall"
            style={[styles.hint, { color: theme.colors.onErrorContainer }]}
          >
            {hint}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  textBlock: { flex: 1, gap: spacing.xs },
  message: { fontWeight: '600' },
  hint: { opacity: 0.85 },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  inlineText: { flex: 1 },
});
