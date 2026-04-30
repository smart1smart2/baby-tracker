import { Dimensions } from 'react-native';

import { spacing } from '@/constants';

/**
 * Width available for a chart inside a ChartCard rendered in ScreenContainer.
 * Subtracts screen padding (lg) and card padding (lg) on each side, plus a
 * fixed reserve for the Y-axis label gutter that `react-native-gifted-charts`
 * renders to the left of the supplied `width` (rather than inside it).
 */
const Y_AXIS_GUTTER = 40;
export const CHART_WIDTH =
  Dimensions.get('window').width - spacing.lg * 4 - Y_AXIS_GUTTER;
