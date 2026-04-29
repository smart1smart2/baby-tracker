import { type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ChoiceTile } from './ChoiceTile';
import { spacing } from '@/constants';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type KindOption<T extends string> = {
  value: T;
  icon: IconName;
  label: string;
};

type Props<T extends string> = {
  items: KindOption<T>[];
  value: T;
  onChange: (next: T) => void;
  /** Tiles per row. Default 3 (3 cells fit, more wrap to next line). */
  columns?: 2 | 3;
};

/**
 * Tile-grid kind selector shared by every domain form (feeding kind,
 * diaper kind, measurement kind). Wraps ChoiceTile with a primary-tinted
 * active state and a flex layout sized for the requested column count.
 */
export function KindGrid<T extends string>({ items, value, onChange, columns = 3 }: Props<T>) {
  const theme = useTheme();
  const cellBasis = columns === 2 ? '48%' : '31%';
  return (
    <View style={styles.grid}>
      {items.map((opt) => (
        <View key={opt.value} style={[styles.cell, { flexBasis: cellBasis }]}>
          <ChoiceTile
            icon={opt.icon}
            label={opt.label}
            tint={theme.colors.primary}
            selected={value === opt.value}
            onPress={() => onChange(opt.value)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: { flexGrow: 1, flexDirection: 'row' },
});
