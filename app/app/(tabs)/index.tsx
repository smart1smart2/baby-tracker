import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Button, IconButton, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { addDays, format, isSameDay, subDays } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

import { supabase } from '@/lib/supabase';
import { useChildren } from '@/features/children/queries';
import { useDiapersForDay } from '@/features/diapers/queries';
import { useFeedingsForDay } from '@/features/feedings/queries';
import { useMeasurementsForDay } from '@/features/measurements/queries';
import { useActiveSleep, useSleepsForDay } from '@/features/sleeps/queries';
import { useActiveChild } from '@/stores/activeChild';
import { useAuth } from '@/providers/AuthProvider';
import {
  diaperToEvent,
  feedingToEvent,
  measurementToEvent,
  sleepToEvent,
  type EventItem,
} from '@/lib/events';

import { ScreenContainer } from '@/components/ScreenContainer';
import { HeroCard } from '@/components/HeroCard';
import { StatsRow, type StatItem } from '@/components/StatsRow';
import { ActionCard } from '@/components/ActionCard';
import { ActiveSleepCard } from '@/components/ActiveSleepCard';
import { EventListItem } from '@/components/EventListItem';
import { ActiveChildPanel } from '@/components/ActiveChildPanel';
import { useConfirm } from '@/components/ConfirmDialog';
import { categoryColors, radii, shadows, spacing } from '@/constants';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type QuickAction = {
  key: 'feeding' | 'sleep' | 'diaper' | 'measurement';
  icon: IconName;
  tint: string;
  /** When set, tapping the card pushes this route. Else it's a no-op stub. */
  path?: '/feedings/new' | '/sleeps/new' | '/diapers/new' | '/measurements/new';
};

const QUICK_ACTIONS: QuickAction[] = [
  { key: 'feeding', icon: 'baby-bottle-outline', tint: categoryColors.feeding, path: '/feedings/new' },
  { key: 'sleep', icon: 'sleep', tint: categoryColors.sleep, path: '/sleeps/new' },
  { key: 'diaper', icon: 'human-baby-changing-table', tint: categoryColors.diaper, path: '/diapers/new' },
  { key: 'measurement', icon: 'scale-bathroom', tint: categoryColors.growth, path: '/measurements/new' },
];

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'uk' ? uk : enUS;
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

  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const isToday = isSameDay(selectedDay, new Date());

  const { data: feedings = [] } = useFeedingsForDay(activeChildId, selectedDay);
  const { data: sleeps = [] } = useSleepsForDay(activeChildId, selectedDay);
  const { data: diapers = [] } = useDiapersForDay(activeChildId, selectedDay);
  const { data: measurements = [] } = useMeasurementsForDay(activeChildId, selectedDay);
  const { data: activeSleep } = useActiveSleep(activeChildId);

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
        value: String(feedings.length),
        label: t('home.stats.feedings'),
      },
      {
        icon: 'sleep',
        tint: categoryColors.sleep,
        value: String(sleeps.length),
        label: t('home.stats.sleep'),
      },
      {
        icon: 'human-baby-changing-table',
        tint: categoryColors.diaper,
        value: String(diapers.length),
        label: t('home.stats.diapers'),
      },
    ],
    [feedings.length, sleeps.length, diapers.length, t],
  );

  const events: EventItem[] = useMemo(() => {
    const items: EventItem[] = [
      ...feedings.map((f) => feedingToEvent(f, t)),
      ...sleeps.map((s) => sleepToEvent(s, t, dateLocale)),
      ...diapers.map((d) => diaperToEvent(d, t)),
      ...measurements.map((m) => measurementToEvent(m, t)),
    ];
    return items.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }, [feedings, sleeps, diapers, measurements, t, dateLocale]);

  const dayLabel = isToday
    ? t('home.today')
    : format(selectedDay, 'd MMMM', { locale: dateLocale });

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

          {activeSleep ? (
            <>
              <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                {t('home.inProgress')}
              </Text>
              <ActiveSleepCard
                sleep={activeSleep}
                onPress={() => router.push('/sleeps/new')}
              />
            </>
          ) : null}

          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            {t('home.quickActions')}
          </Text>

          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((a) => (
              <ActionCard
                key={a.key}
                icon={a.icon}
                label={t(`home.actions.${a.key}`)}
                hint={t(`home.actions.${a.key}Hint`)}
                tint={a.tint}
                onPress={() => {
                  if (a.path) router.push(a.path);
                }}
              />
            ))}
          </View>

          <View style={styles.daySectionHeader}>
            <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
              {dayLabel}
            </Text>
            <View style={styles.dayNav}>
              <IconButton
                icon="chevron-left"
                size={20}
                onPress={() => setSelectedDay((d) => subDays(d, 1))}
                accessibilityLabel={t('home.day.previous')}
              />
              <IconButton
                icon="chevron-right"
                size={20}
                disabled={isToday}
                onPress={() => setSelectedDay((d) => addDays(d, 1))}
                accessibilityLabel={t('home.day.next')}
              />
            </View>
          </View>

          <View
            style={[
              styles.listCard,
              shadows.sm,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            {events.length === 0 ? (
              <Text
                variant="bodyMedium"
                style={[styles.emptyList, { color: theme.colors.onSurfaceVariant }]}
              >
                {t('home.noEvents')}
              </Text>
            ) : (
              events.map((e, idx) => (
                <View key={e.id}>
                  {idx > 0 ? (
                    <View
                      style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]}
                    />
                  ) : null}
                  <EventListItem
                    icon={e.icon}
                    tint={e.tint}
                    title={e.title}
                    subtitle={e.subtitle}
                    time={format(e.occurredAt, 'HH:mm')}
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
      <Text variant="titleLarge" style={{ color: theme.colors.onSurface }}>
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
  daySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayNav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
