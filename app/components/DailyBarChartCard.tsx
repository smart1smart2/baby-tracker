import { type ComponentProps } from 'react';
import { StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { enUS, uk } from 'date-fns/locale';
import { BarChart } from 'react-native-gifted-charts';

import { ChartCard } from './ChartCard';
import { spacing } from '@/constants';
import type { DailyBucket } from '@/lib/aggregate';
import { CHART_WIDTH } from '@/lib/chart';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type Props = {
  title: string;
  icon: IconName;
  tint: string;
  buckets: DailyBucket[];
  /** Optional formatter for the displayed total (default: integer string). */
  formatValue?: (value: number) => string;
  onPress?: () => void;
  onAdd?: () => void;
};

/**
 * Stat card with a 7-day bar chart. Falls back to an empty-state placeholder
 * when there are no entries in the range.
 */
export function DailyBarChartCard({
  title,
  icon,
  tint,
  buckets,
  formatValue,
  onPress,
  onAdd,
}: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'uk' ? uk : enUS;

  const total = buckets.reduce((sum, b) => sum + b.value, 0);
  const hasData = total > 0;
  const max = Math.max(...buckets.map((b) => b.value), 1);
  const fmt = formatValue ?? ((v) => String(v));

  const data = buckets.map((b) => ({
    value: b.value,
    label: format(b.date, 'EEE', { locale: dateLocale }),
    frontColor: tint,
  }));

  const barWidth = Math.max(
    18,
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
          xAxisLabelTextStyle={styles.axisLabel}
          yAxisTextStyle={styles.axisLabel}
          noOfSections={3}
          maxValue={Math.ceil(max * 1.2)}
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
