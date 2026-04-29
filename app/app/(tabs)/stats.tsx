import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { differenceInMinutes, format, parseISO } from 'date-fns';

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
import type { Sleep } from '@/types/domain';

const RANGE_DAYS = 7;

/** A sleep is "night" when it started between 19:00 and 06:59 inclusive. */
const isNightSleep = (s: Sleep) => {
  const h = parseISO(s.started_at).getHours();
  return h >= 19 || h < 7;
};

const sleepHours = (s: Sleep): number => {
  const end = s.ended_at ? parseISO(s.ended_at) : new Date();
  return Math.max(differenceInMinutes(end, parseISO(s.started_at)), 0) / 60;
};

// Typical wet-diaper count per day for an infant. Loose heuristic — varies
// by age + feeding type, but a useful smoke-test signal for parents.
const DIAPER_NORM = { min: 5, max: 8 };

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
    () => aggregateByDay(feedings, (f) => f.started_at, RANGE_DAYS, (acc) => acc + 1),
    [feedings],
  );

  const sleepHoursBuckets = useMemo(
    () =>
      aggregateByDay(
        sleeps,
        (s) => s.started_at,
        RANGE_DAYS,
        (acc, s) => acc + sleepHours(s),
      ),
    [sleeps],
  );

  const diapersBuckets = useMemo(
    () => aggregateByDay(diapers, (d) => d.occurred_at, RANGE_DAYS, (acc) => acc + 1),
    [diapers],
  );

  // Day vs night sleep split — total hours across the selected range so the
  // numbers line up with the bar chart's "X h total" header.
  const sleepSplit = useMemo(() => {
    let night = 0;
    let day = 0;
    sleeps.forEach((s) => {
      const h = sleepHours(s);
      if (isNightSleep(s)) night += h;
      else day += h;
    });
    return { night, day };
  }, [sleeps]);

  // Average per *active* day so a sparse tracker doesn't get a bogus "below
  // norm" warning when they've only logged a single entry. Hide entirely
  // until there's at least 3 days of data — the indicator only carries
  // meaning over a stretch of consistent tracking.
  const diaperActiveDays = useMemo(
    () => new Set(diapers.map((d) => format(parseISO(d.occurred_at), 'yyyy-MM-dd'))).size,
    [diapers],
  );
  const diaperAvgRaw = diaperActiveDays > 0 ? diapers.length / diaperActiveDays : 0;
  const diaperAvg = Math.round(diaperAvgRaw);
  const diaperHint =
    diaperActiveDays < 3 || diaperAvg < 1
      ? null
      : diaperAvg < DIAPER_NORM.min
        ? t('stats.diapers.belowRange', { avg: diaperAvg })
        : diaperAvg > DIAPER_NORM.max
          ? t('stats.diapers.aboveRange', { avg: diaperAvg })
          : t('stats.diapers.withinRange', DIAPER_NORM);

  if (measurementsLoading) return <LoadingScreen />;

  return (
    <ScreenContainer>
      <Text variant="titleLarge" style={[styles.screenTitle, { color: theme.colors.onBackground }]}>
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
        formatValue={(v) => t('stats.sleep.totalHours', { hours: v.toFixed(1) })}
        onPress={() => router.push('/sleeps')}
        onAdd={() => router.push('/sleeps/new')}
      />
      {sleeps.length > 0 ? (
        <View style={styles.subStat}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('stats.sleep.night', { hours: sleepSplit.night.toFixed(1) })}
            {'  ·  '}
            {t('stats.sleep.day', { hours: sleepSplit.day.toFixed(1) })}
          </Text>
        </View>
      ) : null}

      <DailyBarChartCard
        title={t('stats.diapers.title')}
        icon="human-baby-changing-table"
        tint={categoryColors.diaper}
        buckets={diapersBuckets}
        formatValue={(v) => t('stats.diapers.totalCount', { count: v })}
        onPress={() => router.push('/diapers')}
        onAdd={() => router.push('/diapers/new')}
      />
      {diaperHint ? (
        <View style={styles.subStat}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {diaperHint}
          </Text>
        </View>
      ) : null}

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
  subStat: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.sm,
  },
});
