import { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { supabase } from '@/lib/supabase';
import { useChildren } from '@/features/children/queries';
import { useFeedingsToday } from '@/features/feedings/queries';
import { feedingKindKey } from '@/features/feedings/labels';
import { useActiveChild } from '@/stores/activeChild';
import { useAuth } from '@/providers/AuthProvider';

import { ScreenContainer } from '@/components/ScreenContainer';
import { HeroCard } from '@/components/HeroCard';
import { StatsRow, type StatItem } from '@/components/StatsRow';
import { ActionCard } from '@/components/ActionCard';
import { EventListItem } from '@/components/EventListItem';
import { ActiveChildPanel } from '@/components/ActiveChildPanel';
import { useConfirm } from '@/components/ConfirmDialog';
import { categoryColors, radii, shadows, spacing } from '@/constants';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { session } = useAuth();
  const { data: children = [], isLoading, isRefetching, refetch } = useChildren();
  const activeChildId = useActiveChild((s) => s.activeChildId);
  const setActiveChildId = useActiveChild((s) => s.setActiveChildId);

  useEffect(() => {
    if (children.length === 0) {
      if (activeChildId !== null) setActiveChildId(null);
      return;
    }
    const stillExists = children.some((c) => c.id === activeChildId);
    if (!stillExists) setActiveChildId(children[0].id);
  }, [children, activeChildId, setActiveChildId]);

  const activeChild = children.find((c) => c.id === activeChildId) ?? null;
  const { data: feedingsToday = [] } = useFeedingsToday(activeChildId);

  const greetingName = useMemo(() => {
    const fullName = (session?.user.user_metadata as { full_name?: string } | undefined)?.full_name;
    return fullName ?? session?.user.email ?? null;
  }, [session]);

  const confirm = useConfirm();
  const confirmLogout = async () => {
    const ok = await confirm({
      title: t('home.logoutConfirm.title'),
      message: t('home.logoutConfirm.message'),
      confirmLabel: t('home.logoutConfirm.action'),
      destructive: true,
    });
    if (ok) await supabase.auth.signOut();
  };

  const stats: StatItem[] = useMemo(
    () => [
      {
        icon: 'baby-bottle-outline',
        tint: categoryColors.feeding,
        value: String(feedingsToday.length),
        label: t('home.stats.feedings'),
      },
      {
        icon: 'sleep',
        tint: categoryColors.sleep,
        value: '0',
        label: t('home.stats.sleep'),
      },
      {
        icon: 'human-baby-changing-table',
        tint: categoryColors.diaper,
        value: '0',
        label: t('home.stats.diapers'),
      },
    ],
    [feedingsToday.length, t],
  );

  return (
    <ScreenContainer refreshing={isRefetching} onRefresh={refetch}>
      <HeroCard greetingName={greetingName} onLogout={confirmLogout} />

      {children.length > 0 ? (
        <ActiveChildPanel
          children={children}
          activeId={activeChildId}
          onSelect={setActiveChildId}
          onAdd={() => router.push('/children/new')}
          onEdit={(id) => router.push(`/children/${id}/edit`)}
        />
      ) : null}

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator />
        </View>
      ) : children.length === 0 ? (
        <EmptyState onAdd={() => router.push('/children/new')} />
      ) : (
        <>
          <StatsRow items={stats} />

          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            {t('home.quickActions')}
          </Text>

          <View style={styles.actionsGrid}>
            <ActionCard
              icon="baby-bottle-outline"
              label={t('home.actions.feeding')}
              hint={t('home.actions.feedingHint')}
              tint={categoryColors.feeding}
              onPress={() => router.push('/feedings/new')}
            />
            <ActionCard
              icon="sleep"
              label={t('home.actions.sleep')}
              hint={t('home.actions.sleepHint')}
              tint={categoryColors.sleep}
              onPress={() => {}}
            />
            <ActionCard
              icon="human-baby-changing-table"
              label={t('home.actions.diaper')}
              hint={t('home.actions.diaperHint')}
              tint={categoryColors.diaper}
              onPress={() => {}}
            />
            <ActionCard
              icon="scale-bathroom"
              label={t('home.actions.measurement')}
              hint={t('home.actions.measurementHint')}
              tint={categoryColors.growth}
              onPress={() => {}}
            />
          </View>

          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            {t('home.today')}
          </Text>

          <View
            style={[
              styles.listCard,
              shadows.sm,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            {feedingsToday.length === 0 ? (
              <Text
                variant="bodyMedium"
                style={[styles.emptyList, { color: theme.colors.onSurfaceVariant }]}
              >
                {t('home.noEvents')}
              </Text>
            ) : (
              feedingsToday.slice(0, 6).map((f, idx) => (
                <View key={f.id}>
                  {idx > 0 ? (
                    <View
                      style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]}
                    />
                  ) : null}
                  <EventListItem
                    icon="baby-bottle-outline"
                    tint={categoryColors.feeding}
                    title={t(feedingKindKey(f.kind))}
                    subtitle={f.amount_ml ? t('feedings.amountWithUnit', { amount: f.amount_ml }) : undefined}
                    time={format(parseISO(f.started_at), 'HH:mm')}
                  />
                </View>
              ))
            )}
          </View>

        </>
      )}
    </ScreenContainer>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View
      style={[styles.empty, shadows.sm, { backgroundColor: theme.colors.surface }]}
    >
      <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
        {t('home.empty.title')}
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.emptyBody, { color: theme.colors.onSurfaceVariant }]}
      >
        {t('home.empty.body')}
      </Text>
      <Button mode="contained" onPress={onAdd} style={styles.emptyAction}>
        {t('home.empty.cta')}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { paddingVertical: spacing.xxxl, alignItems: 'center' },
  sectionTitle: { fontWeight: '700', marginTop: spacing.xs },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  listCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.xl,
  },
  divider: { height: StyleSheet.hairlineWidth },
  emptyList: { paddingVertical: spacing.lg, textAlign: 'center' },
  empty: {
    padding: spacing.xl,
    borderRadius: radii.xl,
    gap: spacing.sm,
  },
  emptyBody: { marginTop: spacing.xs },
  emptyAction: { marginTop: spacing.md, alignSelf: 'flex-start', borderRadius: radii.lg },
});
