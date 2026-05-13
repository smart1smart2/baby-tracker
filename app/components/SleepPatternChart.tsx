import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';

import { ChartCard } from './ChartCard';
import { categoryColors } from '@/constants';
import { useDateLocale } from '@/hooks/use-date-locale';
import {
  SLEEP_PATTERN_HOURS,
  type SleepPatternDay,
} from '@/hooks/use-sleep-pattern';
import { CHART_WIDTH } from '@/lib/chart';

type Props = {
  days: SleepPatternDay[];
  onPress?: () => void;
};

const LEFT_GUTTER = 28;
const TOP_PAD = 10;
const BOTTOM_GUTTER = 18;
const CHART_HEIGHT = 200;
const MIN_BLOCK_HEIGHT = 4;
const HOUR_TICKS = [0, 6, 12, 18, 24];

/**
 * 24-hour sleep pattern: each day a column, each sleep a rounded block from
 * its start hour to its end hour, sleeps crossing midnight split into the
 * adjacent days. Reads at a glance like a pediatric sleep chart — main
 * night sleep appears as a tall block at the top, naps as shorter blocks
 * during the day.
 */
export function SleepPatternChart({ days, onPress }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const locale = useDateLocale();

  const totalSleep = useMemo(
    () =>
      days.reduce(
        (acc, d) => acc + d.blocks.reduce((s, b) => s + (b.endHour - b.startHour), 0),
        0,
      ),
    [days],
  );

  const width = CHART_WIDTH;
  const innerWidth = width - LEFT_GUTTER;
  const innerHeight = CHART_HEIGHT - BOTTOM_GUTTER - TOP_PAD;
  const dayWidth = innerWidth / Math.max(days.length, 1);
  const blockPadding = 3;
  const hourToY = (h: number) => TOP_PAD + (h / SLEEP_PATTERN_HOURS) * innerHeight;

  const subtitle =
    totalSleep > 0
      ? t('stats.sleepPattern.subtitle', {
          hours: (totalSleep / Math.max(days.length, 1)).toFixed(1),
        })
      : t('stats.sleepPattern.empty');

  return (
    <ChartCard
      title={t('stats.sleepPattern.title')}
      icon="weather-night"
      tint={categoryColors.sleep}
      subtitle={subtitle}
      onPress={onPress}
    >
      <Svg width={width} height={CHART_HEIGHT} style={styles.svg}>
        <G>
          {HOUR_TICKS.map((h) => (
            <G key={`tick-${h}`}>
              <Line
                x1={LEFT_GUTTER}
                y1={hourToY(h)}
                x2={width}
                y2={hourToY(h)}
                stroke={theme.colors.outlineVariant}
                strokeWidth={0.5}
                strokeDasharray={h === 0 || h === SLEEP_PATTERN_HOURS ? undefined : '3,3'}
              />
              <SvgText
                x={LEFT_GUTTER - 4}
                y={hourToY(h) + 3}
                fontSize={9}
                fill={theme.colors.onSurfaceVariant}
                textAnchor="end"
              >
                {h.toString().padStart(2, '0')}
              </SvgText>
            </G>
          ))}
        </G>

        <G>
          {days.map((day, idx) => {
            const colX = LEFT_GUTTER + idx * dayWidth;
            const inner = dayWidth - blockPadding * 2;
            return (
              <G key={day.key}>
                {day.blocks.map((b, j) => {
                  const y = hourToY(b.startHour);
                  const rawH = hourToY(b.endHour) - y;
                  const h = Math.max(rawH, MIN_BLOCK_HEIGHT);
                  return (
                    <Rect
                      key={`b-${j}`}
                      x={colX + blockPadding}
                      y={y}
                      width={inner}
                      height={h}
                      rx={4}
                      ry={4}
                      fill={categoryColors.sleep}
                      opacity={0.85}
                    />
                  );
                })}
                <SvgText
                  x={colX + dayWidth / 2}
                  y={CHART_HEIGHT - 4}
                  fontSize={9}
                  fill={theme.colors.onSurfaceVariant}
                  textAnchor="middle"
                >
                  {format(day.date, 'EEEEEE', { locale })}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  svg: { backgroundColor: 'transparent' },
});
