import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { LineChart } from 'react-native-gifted-charts';

import { ChartCard } from './ChartCard';
import { palette, radii, spacing } from '@/constants';
import {
  defaultUnit,
  measurementKindIcon,
  measurementKindKey,
} from '@/features/measurements/labels';
import {
  ageMonthsAt,
  classifyValue,
  whoBands,
  type Bands,
  type PercentileBand,
} from '@/features/measurements/who';
import { useDateLocale } from '@/hooks/use-date-locale';
import { CHART_WIDTH } from '@/lib/chart';
import type { Child, GrowthMeasurement, MeasurementKind } from '@/types/domain';

type Props = {
  kind: MeasurementKind;
  tint: string;
  measurements: GrowthMeasurement[];
  /** Active child — when provided + DOB + sex known, WHO bands overlay. */
  child: Child | null | undefined;
  onPress?: () => void;
  onAdd?: () => void;
};

const BAND_COLORS: Record<PercentileBand, string> = {
  below_p3: palette.error,
  p3_p15: palette.warning,
  p15_p85: palette.success,
  p85_p97: palette.warning,
  above_p97: palette.error,
};

/**
 * Stat card with a line chart of all measurements for one kind. When the
 * active child has a date of birth, WHO Child Growth Standards percentile
 * lines (P3 / P15 / P50 / P85 / P97) are overlaid as faint reference
 * curves and the latest reading's percentile band is shown as a chip.
 */
export function MeasurementChartCard({
  kind,
  tint,
  measurements,
  child,
  onPress,
  onAdd,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const unit = defaultUnit(kind);

  // Source rows are newest-first; flip to oldest-first for left-to-right chart.
  const series = useMemo(
    () =>
      measurements
        .slice()
        .reverse()
        .map((m) => ({
          value: m.value,
          label: format(parseISO(m.measured_at), 'd MMM', { locale: dateLocale }),
        })),
    [measurements, dateLocale],
  );

  const referenceSeries = useMemo(() => {
    if (!child?.date_of_birth) return null;
    const sex = child.sex ?? 'unspecified';
    const ordered = measurements.slice().reverse();
    const bandsForEach = ordered.map((m) =>
      whoBands(sex, kind, ageMonthsAt(child.date_of_birth, m.measured_at)),
    );
    if (bandsForEach.some((b) => b == null)) return null;

    const pick = (key: keyof Bands) =>
      bandsForEach.map((b) => ({ value: (b as Bands)[key] }));
    return {
      p3: pick('p3'),
      p50: pick('p50'),
      p97: pick('p97'),
    };
  }, [child?.date_of_birth, child?.sex, kind, measurements]);

  const latestBand = useMemo(() => {
    if (!child?.date_of_birth) return null;
    const latest = measurements[0];
    if (!latest) return null;
    const bands = whoBands(
      child.sex ?? 'unspecified',
      kind,
      ageMonthsAt(child.date_of_birth, latest.measured_at),
    );
    if (!bands) return null;
    return classifyValue(latest.value, bands);
  }, [child?.date_of_birth, child?.sex, kind, measurements]);

  const latest = measurements[0] ?? null;
  const subtitle = latest
    ? `${latest.value} ${unit} · ${format(parseISO(latest.measured_at), 'd MMM yyyy', { locale: dateLocale })}`
    : t('measurements.trends.noEntries');

  const refLineColor = theme.colors.outlineVariant;
  const refMidColor = theme.colors.onSurfaceVariant;


  return (
    <ChartCard
      title={t(measurementKindKey(kind))}
      icon={measurementKindIcon(kind)}
      tint={tint}
      subtitle={subtitle}
      onPress={onPress}
      onAdd={onAdd}
    >
      {series.length >= 2 ? (
        <>
          <LineChart
            data={series}
            data2={referenceSeries?.p50}
            color2={refMidColor}
            thickness2={1.5}
            data3={referenceSeries?.p3}
            color3={refLineColor}
            thickness3={1}
            strokeDashArray3={[4, 4]}
            data4={referenceSeries?.p97}
            color4={refLineColor}
            thickness4={1}
            strokeDashArray4={[4, 4]}
            hideDataPoints2
            hideDataPoints3
            hideDataPoints4
            width={CHART_WIDTH}
            height={140}
            thickness={3}
            color={tint}
            dataPointsColor={tint}
            textColor={theme.colors.onSurfaceVariant}
            xAxisColor={theme.colors.outlineVariant}
            yAxisColor={theme.colors.outlineVariant}
            rulesColor={theme.colors.outlineVariant}
            xAxisLabelTextStyle={[styles.axisLabel, { color: theme.colors.onSurfaceVariant }]}
            yAxisTextStyle={[styles.axisLabel, { color: theme.colors.onSurfaceVariant }]}
            initialSpacing={10}
            endSpacing={10}
            curved
            areaChart
            startFillColor={tint}
            endFillColor={tint}
            startOpacity={0.25}
            endOpacity={0.05}
            showVerticalLines={false}
            dataPointsRadius={4}
          />
          {latestBand ? (
            <Pressable
              onPress={() =>
                Alert.alert(
                  t(`measurements.percentileBand.${latestBand}`),
                  t(`measurements.percentileBandHint.${latestBand}`),
                )
              }
              accessibilityRole="button"
              accessibilityHint={t('measurements.percentileBandTapHint')}
              style={({ pressed }) => [
                styles.bandChip,
                { backgroundColor: `${BAND_COLORS[latestBand]}22`, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View
                style={[styles.bandDot, { backgroundColor: BAND_COLORS[latestBand] }]}
              />
              <Text
                variant="labelMedium"
                style={{ color: theme.colors.onSurface, fontWeight: '600' }}
              >
                {t(`measurements.percentileBand.${latestBand}`)}
              </Text>
              <Text
                variant="labelSmall"
                style={{ color: theme.colors.onSurfaceVariant, marginLeft: 2 }}
              >
                ⓘ
              </Text>
            </Pressable>
          ) : null}
        </>
      ) : (
        <Text
          variant="bodySmall"
          style={[styles.placeholder, { color: theme.colors.onSurfaceVariant }]}
        >
          {series.length === 1
            ? t('measurements.trends.needTwoPoints')
            : t('measurements.trends.noEntries')}
        </Text>
      )}
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  axisLabel: { fontSize: 10 },
  placeholder: { textAlign: 'center', paddingVertical: spacing.lg },
  bandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    marginTop: spacing.sm,
  },
  bandDot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
  },
});
