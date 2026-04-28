import { View, StyleSheet, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { palette, radii, spacing } from '@/constants';
import { setLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/i18n';

type Props = {
  /** Visual tone — 'dark' for use over a coloured/gradient background. */
  tone?: 'light' | 'dark';
};

export function LanguageSwitcher({ tone = 'light' }: Props) {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const current = i18n.language as SupportedLanguage;

  const isDark = tone === 'dark';
  const containerBg = isDark ? 'rgba(255,255,255,0.16)' : theme.colors.surfaceVariant;
  const activeBg = isDark ? palette.white : theme.colors.primary;
  const inactiveColor = isDark ? palette.whiteMuted : theme.colors.onSurfaceVariant;
  const activeColor = isDark ? theme.colors.primary : theme.colors.onPrimary;

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = lang === current;
        return (
          <Pressable
            key={lang}
            onPress={() => {
              if (!isActive) void setLanguage(lang);
            }}
            style={[
              styles.item,
              isActive ? { backgroundColor: activeBg } : null,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              variant="labelMedium"
              style={{ color: isActive ? activeColor : inactiveColor, fontWeight: '700' }}
            >
              {lang.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  item: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    minWidth: 36,
    alignItems: 'center',
  },
});
