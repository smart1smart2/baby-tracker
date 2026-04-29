import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { formatDistanceStrict, parseISO } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';

import { iconSizes, palette, radii, shadows, spacing } from '@/constants';
import { useStopSleep } from '@/features/sleeps/queries';
import { useNow } from '@/hooks/use-now';
import type { Sleep } from '@/types/domain';

type Props = {
  sleep: Sleep;
  /** Optional tap handler — usually opens the sleep details/edit screen. */
  onPress?: () => void;
};

/**
 * Live-ticking card that shows an in-progress sleep with a Stop button.
 * Re-renders every second to keep the duration label fresh.
 */
export function ActiveSleepCard({ sleep, onPress }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'uk' ? uk : enUS;
  const stopSleep = useStopSleep();
  const now = useNow();

  // Pass a shared `now` to formatDistanceStrict so two instances of this card
  // (e.g. home + modal) always show the same rounded label. floor rounding
  // also avoids the rounded-up minute flicker as the duration crosses .5.
  const since = formatDistanceStrict(parseISO(sleep.started_at), new Date(now), {
    locale: dateLocale,
    roundingMethod: 'floor',
  });

  const content = (
    <>
      <MaterialCommunityIcons
        name="sleep"
        size={iconSizes.xl}
        color={theme.colors.primary}
      />
      <View style={styles.text}>
        <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
          {t('sleeps.new.activeSleep')}
        </Text>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          {since}
        </Text>
      </View>
      <Button
        mode="contained"
        onPress={() => stopSleep.mutate(sleep.id)}
        loading={stopSleep.isPending}
        disabled={stopSleep.isPending}
        buttonColor={palette.error}
        style={styles.button}
      >
        {t('sleeps.new.stopNow')}
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
        style={({ pressed }) => [
          ...cardStyle,
          { opacity: pressed ? 0.85 : 1 },
        ]}
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
