import { View, StyleSheet } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { heroGradient, iconSizes, radii, shadows, spacing } from '@/constants';

type Props = {
  greetingName: string | null;
  onLogout: () => void;
};

export function HeroCard({ greetingName, onLogout }: Props) {
  const { t, i18n } = useTranslation();
  const displayName = greetingName?.trim().split(' ')[0] || t('home.defaultName');
  const locale = i18n.language === 'uk' ? uk : enUS;
  const dateLine = format(new Date(), 'EEEE, d MMMM', { locale });

  return (
    <LinearGradient
      colors={[...heroGradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, shadows.lg]}
    >
      <View style={styles.headerRow}>
        <LanguageSwitcher tone="dark" />
        <IconButton
          icon="logout"
          iconColor="#FFFFFF"
          size={iconSizes.md}
          onPress={onLogout}
        />
      </View>

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
    padding: spacing.xl,
    minHeight: 180,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  content: {
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  greeting: { color: '#FFFFFF', fontWeight: '700' },
  tagline: { color: 'rgba(255,255,255,0.85)' },
  decorOuter: {
    position: 'absolute',
    right: -60,
    top: -30,
    width: 200,
    height: 200,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorInner: {
    position: 'absolute',
    right: -20,
    bottom: -40,
    width: 120,
    height: 120,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
});
