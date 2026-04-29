import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { formatDistanceStrict, parseISO } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';

import { iconSizes, palette, radii, shadows, spacing } from '@/constants';
import { useStopFeeding } from '@/features/feedings/queries';
import { feedingKindKey } from '@/features/feedings/labels';
import { useNow } from '@/hooks/use-now';
import type { Feeding } from '@/types/domain';

type Props = {
  feeding: Feeding;
  onPress?: () => void;
};

/**
 * Live-ticking card for an in-progress breast feeding (start/stop timer).
 * Mirrors ActiveSleepCard so both running timers feel the same on home.
 */
export function ActiveFeedingCard({ feeding, onPress }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'uk' ? uk : enUS;
  const stopFeeding = useStopFeeding();
  const now = useNow();

  const since = formatDistanceStrict(parseISO(feeding.started_at), new Date(now), {
    locale: dateLocale,
    roundingMethod: 'floor',
  });

  const content = (
    <>
      <MaterialCommunityIcons
        name="baby-bottle-outline"
        size={iconSizes.xl}
        color={theme.colors.primary}
      />
      <View style={styles.text}>
        <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
          {t(feedingKindKey(feeding.kind))}
        </Text>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
          {since}
        </Text>
      </View>
      <Button
        mode="contained"
        onPress={() => stopFeeding.mutate(feeding.id)}
        loading={stopFeeding.isPending}
        disabled={stopFeeding.isPending}
        buttonColor={palette.error}
        style={styles.button}
      >
        {t('feedings.new.stopNow')}
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
