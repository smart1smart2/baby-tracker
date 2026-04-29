import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { differenceInMinutes, parseISO } from 'date-fns';

import { LoadingScreen } from '@/components/LoadingScreen';
import { DailyBarChartCard } from '@/components/DailyBarChartCard';
import { MeasurementChartCard } from '@/components/MeasurementChartCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { categoryColors, spacing } from '@/constants';
import { useDiapersInRange } from '@/features/diapers/queries';
import { useFeedingsInRange } from '@/features/feedings/queries';
import {
  MEASUREMENT_KINDS,
  measurementKindTint,
} from '@/features/measurements/labels';
import { useMeasurements } from '@/features/measurements/queries';
import { useSleepsInRange } from '@/features/sleeps/queries';
import { useLastDaysRange } from '@/hooks/use-last-days-range';
import { aggregateByDay } from '@/lib/aggregate';
import { useActiveChild } from '@/stores/activeChild';

const RANGE_DAYS = 7;

export default function StatsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const activeChildId = useActiveChild((s) => s.activeChildId);

  const { from, to } = useLastDaysRange(RANGE_DAYS);

  const { data: feedings = [] } = useFeedingsInRange(activeChildId, from, to);
  const { data: sleeps = [] } = useSleepsInRange(activeChildId, from, to);
  const { data: diapers = [] } = useDiapersInRange(activeChildId, from, to);
  const { data: measurements = [], isLoading: measurementsLoading } =
    useMeasurements(activeChildId);

  const feedingsBuckets = useMemo(
    () =>
      aggregateByDay(
        feedings,
        (f) => f.started_at,
        RANGE_DAYS,
        (acc) => acc + 1,
      ),
    [feedings],
  );

  const sleepHoursBuckets = useMemo(
    () =>
      aggregateByDay(
        sleeps,
        (s) => s.started_at,
        RANGE_DAYS,
        (acc, s) => {
          const end = s.ended_at ? parseISO(s.ended_at) : new Date();
          const minutes = Math.max(differenceInMinutes(end, parseISO(s.started_at)), 0);
          return acc + minutes / 60;
        },
      ),
    [sleeps],
  );

  const diapersBuckets = useMemo(
    () =>
      aggregateByDay(
        diapers,
        (d) => d.occurred_at,
        RANGE_DAYS,
        (acc) => acc + 1,
      ),
    [diapers],
  );

  if (measurementsLoading) return <LoadingScreen />;

  return (
    <ScreenContainer>
      <Text variant="titleLarge" style={[styles.screenTitle, { color: theme.colors.onBackground }]}>
        {t('stats.title')}
      </Text>

      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
        {t('stats.lastWeek.title')}
      </Text>

      <DailyBarChartCard
        title={t('stats.feedings.title')}
        icon="baby-bottle-outline"
        tint={categoryColors.feeding}
        buckets={feedingsBuckets}
        formatValue={(v) => t('stats.feedings.totalCount', { count: v })}
        onPress={() => router.push('/feedings')}
        onAdd={() => router.push('/feedings/new')}
      />

      <DailyBarChartCard
        title={t('stats.sleep.title')}
        icon="sleep"
        tint={categoryColors.sleep}
        buckets={sleepHoursBuckets}
        formatValue={(v) =>
          t('stats.sleep.totalHours', { hours: v.toFixed(1) })
        }
        onPress={() => router.push('/sleeps')}
        onAdd={() => router.push('/sleeps/new')}
      />

      <DailyBarChartCard
        title={t('stats.diapers.title')}
        icon="human-baby-changing-table"
        tint={categoryColors.diaper}
        buckets={diapersBuckets}
        formatValue={(v) => t('stats.diapers.totalCount', { count: v })}
        onPress={() => router.push('/diapers')}
        onAdd={() => router.push('/diapers/new')}
      />

      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
        {t('stats.growth.title')}
      </Text>

      {MEASUREMENT_KINDS.map((kind) => (
        <MeasurementChartCard
          key={kind}
          kind={kind}
          tint={measurementKindTint(kind)}
          measurements={measurements.filter((m) => m.kind === kind)}
          onPress={() => router.push('/measurements')}
          onAdd={() => router.push('/measurements/new')}
        />
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenTitle: { fontWeight: '700' },
  sectionTitle: { fontWeight: '700', marginTop: spacing.sm },
  empty: { paddingVertical: spacing.xxl },
});
