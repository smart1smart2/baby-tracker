import { type ReactNode } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { heroGradient, iconSizes, layout, radii, shadows, spacing } from '@/constants';

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthScaffold({ title, subtitle, children }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[...heroGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.decorOuter} />
        <View style={styles.decorInner} />
        <SafeAreaView edges={['top']} style={styles.languageSwitcher} pointerEvents="box-none">
          <LanguageSwitcher tone="dark" />
        </SafeAreaView>
        <SafeAreaView edges={['top']} style={styles.brandSafe}>
          <View style={styles.brandRing}>
            <View style={styles.brandInner}>
              <MaterialCommunityIcons
                name="baby-face-outline"
                size={iconSizes.xl}
                color={theme.colors.primary}
              />
            </View>
          </View>
          <Text variant="displaySmall" style={styles.appName}>
            {t('brand.name')}
          </Text>
          <Text variant="bodyMedium" style={styles.tagline}>
            {t('brand.tagline')}
          </Text>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.card,
              shadows.lg,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text
              variant="headlineSmall"
              style={[styles.title, { color: theme.colors.onSurface }]}
            >
              {title}
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              {subtitle}
            </Text>
            <View style={styles.form}>{children}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const GRADIENT_HEIGHT = 320;

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: {
    height: GRADIENT_HEIGHT,
    overflow: 'hidden',
    borderBottomLeftRadius: radii.xxl,
    borderBottomRightRadius: radii.xxl,
  },
  decorOuter: {
    position: 'absolute',
    top: -60,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorInner: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    width: 160,
    height: 160,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  brandSafe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  languageSwitcher: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: layout.screenPadding,
    zIndex: 1,
  },
  brandRing: {
    width: 96,
    height: 96,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  brandInner: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { color: '#FFFFFF', fontWeight: '700' },
  tagline: { color: 'rgba(255,255,255,0.85)', marginTop: spacing.xs },
  kav: { flex: 1, marginTop: -spacing.xl },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding + spacing.sm,
    paddingBottom: spacing.xxl,
  },
  card: {
    padding: layout.cardPadding,
    borderRadius: radii.xxl,
  },
  title: { fontWeight: '700', textAlign: 'center' },
  subtitle: { marginTop: spacing.xs, textAlign: 'center' },
  form: { marginTop: spacing.xl, gap: spacing.md },
});
