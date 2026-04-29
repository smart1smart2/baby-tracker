import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';
import { LineChart } from 'react-native-gifted-charts';

import { ChartCard } from './ChartCard';
import { spacing } from '@/constants';
import {
  defaultUnit,
  measurementKindIcon,
  measurementKindKey,
} from '@/features/measurements/labels';
import { CHART_WIDTH } from '@/lib/chart';
import type { GrowthMeasurement, MeasurementKind } from '@/types/domain';

type Props = {
  kind: MeasurementKind;
  tint: string;
  measurements: GrowthMeasurement[];
  onPress?: () => void;
  onAdd?: () => void;
};

/**
 * Stat card with a line chart of all measurements for one kind. Shows the
 * latest reading in the subtitle and a placeholder body until there are at
 * least two data points.
 */
export function MeasurementChartCard({
  kind,
  tint,
  measurements,
  onPress,
  onAdd,
}: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'uk' ? uk : enUS;
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

  const latest = measurements[0] ?? null;
  const subtitle = latest
    ? `${latest.value} ${unit} · ${format(parseISO(latest.measured_at), 'd MMM yyyy', { locale: dateLocale })}`
    : t('measurements.trends.noEntries');

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
        <LineChart
          data={series}
          width={CHART_WIDTH}
          height={140}
          thickness={3}
          color={tint}
          dataPointsColor={tint}
          textColor={theme.colors.onSurfaceVariant}
          xAxisColor={theme.colors.outlineVariant}
          yAxisColor={theme.colors.outlineVariant}
          rulesColor={theme.colors.outlineVariant}
          xAxisLabelTextStyle={styles.axisLabel}
          yAxisTextStyle={styles.axisLabel}
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
});
