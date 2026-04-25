import { View, StyleSheet } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { heroGradient, iconSizes, radii, shadows, spacing } from '@/constants';
import { formatAge } from '@/lib/age';
import type { Child } from '@/types/domain';

type Props = {
  greetingName: string | null;
  activeChild: Child | null;
  onLogout: () => void;
};

export function HeroCard({ greetingName, activeChild, onLogout }: Props) {
  const { t } = useTranslation();
  const displayName =
    greetingName?.trim().split(' ')[0] || t('home.defaultName');

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
        {activeChild ? (
          <Text variant="bodyLarge" style={styles.tagline}>
            {activeChild.full_name} · {formatAge(activeChild.date_of_birth, t)}
          </Text>
        ) : (
          <Text variant="bodyLarge" style={styles.tagline}>
            {t('home.noChildHint')}
          </Text>
        )}
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
