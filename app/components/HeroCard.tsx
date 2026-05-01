import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';

import { heroGradient, palette, radii, shadows, spacing } from '@/constants';
import { useDateLocale } from '@/hooks/use-date-locale';

type Props = {
  greetingName: string | null;
};

export function HeroCard({ greetingName }: Props) {
  const { t } = useTranslation();
  const displayName = greetingName?.trim().split(' ')[0] || t('home.defaultName');
  const locale = useDateLocale();
  const dateLine = format(new Date(), 'EEEE, d MMMM', { locale });

  return (
    <LinearGradient
      colors={[...heroGradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, shadows.lg]}
    >
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.greeting}>
          {t('home.greeting', { name: displayName })}
        </Text>
        <Text variant="bodyLarge" style={styles.tagline}>
          {dateLine.charAt(0).toUpperCase() + dateLine.slice(1)}
        </Text>
      </View>

      <View pointerEvents="none" style={styles.decorOuter} />
      <View pointerEvents="none" style={styles.decorInner} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xxl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    overflow: 'hidden',
  },
  content: {
    gap: spacing.xs,
  },
  greeting: { color: palette.white },
  tagline: { color: palette.whiteMuted },
  decorOuter: {
    position: 'absolute',
    right: -60,
    top: -30,
    width: 200,
    height: 200,
    borderRadius: radii.pill,
    backgroundColor: palette.brandDecor,
  },
  decorInner: {
    position: 'absolute',
    right: -20,
    bottom: -40,
    width: 120,
    height: 120,
    borderRadius: radii.pill,
    backgroundColor: palette.brandDecor,
  },
});
