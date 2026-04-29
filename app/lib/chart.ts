import { Dimensions } from 'react-native';

import { spacing } from '@/constants';

/**
 * Width available for a chart inside a ChartCard rendered in ScreenContainer.
 * Subtracts the screen padding (lg) on each side and the card padding (lg)
 * on each side.
 */
export const CHART_WIDTH =
  Dimensions.get('window').width - spacing.lg * 4;
