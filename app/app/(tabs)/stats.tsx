import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { LoadingScreen } from '@/components/LoadingScreen';
import { DailyBarChartCard } from '@/components/DailyBarChartCard';
import { MeasurementChartCard } from '@/components/MeasurementChartCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { categoryColors, spacing } from '@/constants';
import { useChild } from '@/features/children/queries';
import {
  MEASUREMENT_KINDS,
  measurementKindTint,
} from '@/features/measurements/labels';
import { useMeasurements } from '@/features/measurements/queries';
import { useDateLocale } from '@/hooks/use-date-locale';
import { useStatsBuckets } from '@/hooks/use-stats-buckets';
import { exportStatsPdf } from '@/lib/pdf';
import { Sentry } from '@/lib/sentry';
import { useActiveChild } from '@/stores/activeChild';

const RANGE_DAYS = 7;

// Typical wet-diaper count per day for an infant. Loose heuristic — varies
// by age + feeding type, but a useful smoke-test signal for parents.
const DIAPER_NORM = { min: 5, max: 8 };

export default function StatsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const locale = useDateLocale();
  const activeChildId = useActiveChild((s) => s.activeChildId);

  const buckets = useStatsBuckets(activeChildId, RANGE_DAYS);
  const { data: measurements = [], isLoading: measurementsLoading } =
    useMeasurements(activeChildId);
  const { data: child } = useChild(activeChildId);

  const [exporting, setExporting] = useState(false);
  const handleExport = async () => {
    if (!child || exporting) return;
    setExporting(true);
    try {
      await exportStatsPdf({
        child,
        buckets,
        measurements,
        rangeDays: RANGE_DAYS,
        t,
        locale,
      });
    } catch (err) {
      Sentry.captureException(err);
      Alert.alert(t('stats.exportPdf'), t('stats.export.failed'));
    } finally {
      setExporting(false);
    }
  };

  // Hide the diaper hint until there's at least 3 days of data — the
  // indicator only carries meaning over a stretch of consistent tracking.
  const diaperHint =
    buckets.diaperActiveDays < 3 || buckets.diaperAvg < 1
      ? null
      : buckets.diaperAvg < DIAPER_NORM.min
        ? t('stats.diapers.belowRange', { avg: buckets.diaperAvg })
        : buckets.diaperAvg > DIAPER_NORM.max
          ? t('stats.diapers.aboveRange', { avg: buckets.diaperAvg })
          : t('stats.diapers.withinRange', DIAPER_NORM);

  if (measurementsLoading) return <LoadingScreen />;

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text variant="titleLarge" style={[styles.screenTitle, { color: theme.colors.onBackground }]}>
          {t('stats.lastWeek.title')}
        </Text>
        <IconButton
          icon="tray-arrow-down"
          size={24}
          onPress={handleExport}
          disabled={!child || exporting}
          loading={exporting}
          accessibilityLabel={t('stats.exportPdf')}
          style={styles.exportButton}
        />
      </View>

      <DailyBarChartCard
        title={t('stats.feedings.title')}
        icon="baby-bottle-outline"
        tint={categoryColors.feeding}
        buckets={buckets.feedings}
        formatValue={(v) => t('stats.feedings.totalCount', { count: v })}
        onPress={() => router.push('/feedings')}
        onAdd={() => router.push('/feedings/new')}
      />

      <DailyBarChartCard
        title={t('stats.sleep.title')}
        icon="sleep"
        tint={categoryColors.sleep}
        buckets={buckets.sleepHours}
        formatValue={(v) => t('stats.sleep.totalHours', { hours: v.toFixed(1) })}
        onPress={() => router.push('/sleeps')}
        onAdd={() => router.push('/sleeps/new')}
      />
      {buckets.sleepsCount > 0 ? (
        <View style={styles.subStat}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {t('stats.sleep.night', { hours: buckets.sleepSplit.night.toFixed(1) })}
            {'  ·  '}
            {t('stats.sleep.day', { hours: buckets.sleepSplit.day.toFixed(1) })}
          </Text>
        </View>
      ) : null}

      <DailyBarChartCard
        title={t('stats.diapers.title')}
        icon="human-baby-changing-table"
        tint={categoryColors.diaper}
        buckets={buckets.diapers}
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
          child={child}
          onPress={() => router.push('/measurements')}
          onAdd={() => router.push('/measurements/new')}
        />
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  screenTitle: { flex: 1, fontWeight: '700' },
  exportButton: { margin: 0 },
  sectionTitle: { fontWeight: '700', marginTop: spacing.sm },
  subStat: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.sm,
  },
});
