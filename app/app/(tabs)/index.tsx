import { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Chip, Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { format, parseISO } from 'date-fns';

import { supabase } from '@/lib/supabase';
import { useChildren } from '@/features/children/queries';
import { useFeedingsToday } from '@/features/feedings/queries';
import { feedingKindLabel } from '@/features/feedings/labels';
import { useActiveChild } from '@/stores/activeChild';
import { useAuth } from '@/providers/AuthProvider';

import { ScreenContainer } from '@/components/ScreenContainer';
import { HeroCard } from '@/components/HeroCard';
import { StatsRow, type StatItem } from '@/components/StatsRow';
import { ActionCard } from '@/components/ActionCard';
import { EventListItem } from '@/components/EventListItem';
import { categoryColors, radii, shadows, spacing } from '@/constants';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();
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

  const stats: StatItem[] = useMemo(
    () => [
      {
        icon: 'baby-bottle-outline',
        tint: categoryColors.feeding,
        value: String(feedingsToday.length),
        label: 'Годування',
      },
      { icon: 'sleep', tint: categoryColors.sleep, value: '—', label: 'Сон' },
      {
        icon: 'human-baby-changing-table',
        tint: categoryColors.diaper,
        value: '—',
        label: 'Підгузки',
      },
    ],
    [feedingsToday.length],
  );

  return (
    <ScreenContainer refreshing={isRefetching} onRefresh={refetch}>
      <HeroCard
        greetingName={greetingName}
        activeChild={activeChild}
        onLogout={() => supabase.auth.signOut()}
      />

      {children.length > 1 ? (
        <View style={styles.childSwitch}>
          {children.map((c) => (
            <Chip
              key={c.id}
              selected={c.id === activeChildId}
              onPress={() => setActiveChildId(c.id)}
            >
              {c.full_name}
            </Chip>
          ))}
        </View>
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
            Швидкі дії
          </Text>

          <View style={styles.actionsGrid}>
            <ActionCard
              icon="baby-bottle-outline"
              label="Годування"
              hint="Додати запис"
              tint={categoryColors.feeding}
              onPress={() => router.push('/feedings/new')}
            />
            <ActionCard
              icon="sleep"
              label="Сон"
              hint="Старт таймера"
              tint={categoryColors.sleep}
              onPress={() => {}}
            />
            <ActionCard
              icon="human-baby-changing-table"
              label="Підгузок"
              hint="Зміна"
              tint={categoryColors.diaper}
              onPress={() => {}}
            />
            <ActionCard
              icon="scale-bathroom"
              label="Вимірювання"
              hint="Вага / зріст"
              tint={categoryColors.growth}
              onPress={() => {}}
            />
          </View>

          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Сьогодні
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
                Подій ще немає. Натисни на картку дії вище.
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
                    title={feedingKindLabel(f.kind)}
                    subtitle={f.amount_ml ? `${f.amount_ml} мл` : undefined}
                    time={format(parseISO(f.started_at), 'HH:mm')}
                  />
                </View>
              ))
            )}
          </View>

          <Button
            mode="outlined"
            icon="plus"
            onPress={() => router.push('/children/new')}
            style={styles.addChild}
          >
            Додати ще одну дитину
          </Button>
        </>
      )}
    </ScreenContainer>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  const theme = useTheme();
  return (
    <View
      style={[styles.empty, shadows.sm, { backgroundColor: theme.colors.surface }]}
    >
      <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
        Тут поки що порожньо
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.emptyBody, { color: theme.colors.onSurfaceVariant }]}
      >
        Додай дитину, щоб почати вести щоденник годування, сну, підгузків та ваги.
      </Text>
      <Button mode="contained" onPress={onAdd} style={styles.emptyAction}>
        Додати дитину
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { paddingVertical: spacing.xxxl, alignItems: 'center' },
  childSwitch: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sectionTitle: { fontWeight: '700', marginTop: spacing.xs },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  listCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.xl,
  },
  divider: { height: StyleSheet.hairlineWidth },
  emptyList: { paddingVertical: spacing.lg, textAlign: 'center' },
  addChild: { marginTop: spacing.sm, borderRadius: radii.lg },
  empty: {
    padding: spacing.xl,
    borderRadius: radii.xl,
    gap: spacing.sm,
  },
  emptyBody: { marginTop: spacing.xs },
  emptyAction: { marginTop: spacing.md, alignSelf: 'flex-start', borderRadius: radii.lg },
});
