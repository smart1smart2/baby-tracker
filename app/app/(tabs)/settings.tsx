import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SectionLabel } from '@/components/SectionLabel';
import { SettingsRow } from '@/components/SettingsRow';
import { useConfirm } from '@/components/ConfirmDialog';
import { radii, shadows, spacing } from '@/constants';
import { useDeleteMyAccount } from '@/features/auth/mutations';
import { useMyProfile } from '@/features/profile/queries';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useThemePreferenceStore, type ThemePreference } from '@/stores/themePreference';

const THEME_OPTIONS: ThemePreference[] = ['system', 'light', 'dark'];

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { session } = useAuth();
  const { data: profile } = useMyProfile();
  const confirm = useConfirm();
  const deleteAccount = useDeleteMyAccount();
  const themePreference = useThemePreferenceStore((s) => s.preference);
  const setThemePreference = useThemePreferenceStore((s) => s.setPreference);

  const fullName =
    profile?.full_name ||
    (session?.user.user_metadata as { full_name?: string } | undefined)?.full_name ||
    '';
  const email = session?.user.email ?? '';
  const version = Constants.expoConfig?.version ?? '0.0.0';

  const onSignOut = async () => {
    const ok = await confirm({
      title: t('home.logoutConfirm.title'),
      message: t('home.logoutConfirm.message'),
      confirmLabel: t('home.logoutConfirm.action'),
      destructive: true,
    });
    if (ok) await supabase.auth.signOut();
  };

  const onDelete = async () => {
    const ok = await confirm({
      title: t('settings.delete.title'),
      message: t('settings.delete.message'),
      confirmLabel: t('settings.delete.action'),
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteAccount.mutateAsync();
    } catch {
      /* AuthGate stays on Settings; user can retry. */
    }
  };

  const cardStyle = [styles.card, shadows.sm, { backgroundColor: theme.colors.surface }];
  const dividerStyle = [styles.divider, { backgroundColor: theme.colors.outlineVariant }];

  return (
    <ScreenContainer>
      <SectionLabel>{t('settings.profile')}</SectionLabel>
      <View style={cardStyle}>
        <SettingsRow
          icon="account-outline"
          label={t('settings.profileLabel')}
          value={fullName || email}
          onPress={() => router.push('/account/profile')}
        />
        <View style={dividerStyle} />
        <SettingsRow
          icon="lock-outline"
          label={t('settings.changePassword')}
          onPress={() => router.push('/account/password')}
        />
      </View>

      <SectionLabel>{t('settings.preferences')}</SectionLabel>
      <View style={cardStyle}>
        <View style={styles.controlRow}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
            {t('settings.language')}
          </Text>
          <LanguageSwitcher />
        </View>
        <View style={dividerStyle} />
        <View style={styles.controlRow}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
            {t('settings.theme')}
          </Text>
          <ThemeToggle value={themePreference} onChange={setThemePreference} />
        </View>
      </View>

      <SectionLabel>{t('settings.account')}</SectionLabel>
      <View style={cardStyle}>
        <SettingsRow
          icon="logout"
          label={t('home.logoutConfirm.action')}
          destructive
          onPress={onSignOut}
        />
        <View style={dividerStyle} />
        <SettingsRow
          icon="trash-can-outline"
          label={t('settings.delete.action')}
          destructive
          onPress={onDelete}
        />
      </View>

      <Text
        variant="bodySmall"
        style={[styles.version, { color: theme.colors.onSurfaceVariant }]}
      >
        {t('settings.version', { version })}
      </Text>
    </ScreenContainer>
  );
}

function ThemeToggle({
  value,
  onChange,
}: {
  value: ThemePreference;
  onChange: (next: ThemePreference) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const labels: Record<ThemePreference, string> = {
    system: t('settings.themeSystem'),
    light: t('settings.themeLight'),
    dark: t('settings.themeDark'),
  };
  return (
    <View style={[toggleStyles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      {THEME_OPTIONS.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => {
              if (!active) onChange(option);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              toggleStyles.item,
              active ? { backgroundColor: theme.colors.primary } : null,
            ]}
          >
            <Text
              variant="labelMedium"
              style={{
                color: active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant,
                fontWeight: '700',
              }}
            >
              {labels[option]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radii.xl,
  },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: -spacing.lg },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  version: { textAlign: 'center', opacity: 0.6 },
});

const toggleStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 2,
    borderRadius: radii.pill,
  },
  item: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    minWidth: 56,
    alignItems: 'center',
  },
});

