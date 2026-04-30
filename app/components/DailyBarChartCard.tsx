import { type ComponentProps } from 'react';
import { StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { BarChart } from 'react-native-gifted-charts';

import { ChartCard } from './ChartCard';
import { spacing } from '@/constants';
import { useDateLocale } from '@/hooks/use-date-locale';
import type { DailyBucket } from '@/lib/aggregate';
import { CHART_WIDTH } from '@/lib/chart';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type Props = {
  title: string;
  icon: IconName;
  tint: string;
  buckets: DailyBucket[];
  /** Callback to format the x-axis label for each bucket. Default: 'EEE'. */
  formatLabel?: (date: Date) => string;
  /** Optional formatter for the displayed total (default: integer string). */
  formatValue?: (value: number) => string;
  onPress?: () => void;
  onAdd?: () => void;
};

/**
 * Stat card showing pre-aggregated buckets as bars. Caller decides the
 * granularity (daily for week view, weekly for month view) and supplies
 * `labelFormat` for the corresponding axis labels.
 */
export function DailyBarChartCard({
  title,
  icon,
  tint,
  buckets,
  formatLabel,
  formatValue,
  onPress,
  onAdd,
}: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const labelFor =
    formatLabel ?? ((d: Date) => format(d, 'EEE', { locale: dateLocale }));

  const total = buckets.reduce((sum, b) => sum + b.value, 0);
  const hasData = total > 0;
  const max = Math.max(...buckets.map((b) => b.value), 1);
  const fmt = formatValue ?? ((v) => String(v));

  // Pick a max value that's always divisible by the section count so the
  // auto-generated Y-axis labels land on whole numbers (e.g. 0, 3, 6, 9).
  const SECTIONS = 4;
  const yMax = Math.max(SECTIONS, Math.ceil((max * 1.2) / SECTIONS) * SECTIONS);

  const data = buckets.map((b) => ({
    value: b.value,
    label: labelFor(b.date),
    frontColor: tint,
  }));

  const barWidth = Math.max(
    20,
    Math.floor((CHART_WIDTH - 40) / buckets.length) - 12,
  );

  return (
    <ChartCard
      title={title}
      icon={icon}
      tint={tint}
      subtitle={fmt(total)}
      onPress={onPress}
      onAdd={onAdd}
    >
      {hasData ? (
        <BarChart
          data={data}
          height={120}
          width={CHART_WIDTH}
          barWidth={barWidth}
          barBorderRadius={4}
          spacing={12}
          yAxisColor="transparent"
          xAxisColor={theme.colors.outlineVariant}
          rulesColor={theme.colors.outlineVariant}
          xAxisLabelTextStyle={[styles.axisLabel, { color: theme.colors.onSurfaceVariant }]}
          yAxisTextStyle={[styles.axisLabel, { color: theme.colors.onSurfaceVariant }]}
          noOfSections={SECTIONS}
          maxValue={yMax}
          formatYLabel={(v) => String(Math.round(Number(v)))}
          initialSpacing={10}
          endSpacing={10}
        />
      ) : (
        <Text
          variant="bodySmall"
          style={[styles.placeholder, { color: theme.colors.onSurfaceVariant }]}
        >
          {t('stats.empty')}
        </Text>
      )}
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  axisLabel: { fontSize: 10 },
  placeholder: { textAlign: 'center', paddingVertical: spacing.lg },
});
