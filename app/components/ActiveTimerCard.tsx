import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatDistanceStrict, parseISO } from 'date-fns';

import { iconSizes, palette, radii, shadows, spacing } from '@/constants';
import { useDateLocale } from '@/hooks/use-date-locale';
import { useNow } from '@/hooks/use-now';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type Props = {
  icon: IconName;
  /** Small primary label above the duration (e.g. "Sleep" or feeding kind). */
  label: string;
  /** ISO timestamp the timer started at. */
  startedAt: string;
  /** Stop button copy. */
  stopLabel: string;
  onStop: () => void;
  stopping?: boolean;
  /** Optional tap handler — usually opens the matching new/edit screen. */
  onPress?: () => void;
};

/**
 * Live-ticking banner shared by sleep + breast-feeding timers. Re-renders once
 * a second via the singleton `useNow` ticker so multiple instances on the
 * same screen stay in sync, and uses floor rounding so the displayed minute
 * doesn't flicker as the duration crosses .5.
 */
export function ActiveTimerCard({
  icon,
  label,
  startedAt,
  stopLabel,
  onStop,
  stopping = false,
  onPress,
}: Props) {
  const theme = useTheme();
  const dateLocale = useDateLocale();
  const now = useNow();

  const since = formatDistanceStrict(parseISO(startedAt), new Date(now), {
    locale: dateLocale,
    roundingMethod: 'floor',
  });

  const content = (
    <>
      <MaterialCommunityIcons
        name={icon}
        size={iconSizes.xl}
        color={theme.colors.primary}
      />
      <View style={styles.text}>
        <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
          {label}
        </Text>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          {since}
        </Text>
      </View>
      <Button
        mode="contained"
        onPress={onStop}
        loading={stopping}
        disabled={stopping}
        buttonColor={palette.error}
        style={styles.button}
      >
        {stopLabel}
      </Button>
    </>
  );

  const cardStyle = [
    styles.card,
    shadows.sm,
    { backgroundColor: theme.colors.primaryContainer },
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...cardStyle, { opacity: pressed ? 0.85 : 1 }]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  text: { flex: 1, gap: 2 },
  button: { borderRadius: radii.lg },
});
