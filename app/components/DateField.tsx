import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { iconSizes, layout, radii, spacing } from '@/constants';

type Props = {
  label: string;
  value: Date | null;
  placeholder?: string;
  onChange: (date: Date) => void;
  maximumDate?: Date;
  minimumDate?: Date;
};

export function DateField({
  label,
  value,
  placeholder = 'Select date',
  onChange,
  maximumDate,
  minimumDate,
}: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const display = value ? format(value, 'd MMM yyyy') : placeholder;
  const hasValue = Boolean(value);

  const handleNativeChange = (event: DateTimePickerEvent, date?: Date) => {
    // Android dispatches `dismissed` on cancel and `set` on confirm — close in either case.
    if (Platform.OS === 'android') setOpen(false);
    if (event.type === 'set' && date) onChange(date);
  };

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.outline,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="calendar-month-outline"
          size={iconSizes.lg}
          color={theme.colors.onSurfaceVariant}
        />
        <View style={styles.textBlock}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {label}
          </Text>
          <Text
            variant="bodyLarge"
            style={{
              color: hasValue ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
              fontWeight: hasValue ? '600' : '400',
            }}
          >
            {display}
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={iconSizes.lg}
          color={theme.colors.onSurfaceVariant}
        />
      </Pressable>

      {open && Platform.OS === 'ios' ? (
        <View
          style={[
            styles.iosPicker,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant },
          ]}
        >
          <DateTimePicker
            value={value ?? new Date()}
            mode="date"
            display="inline"
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            onChange={(_, date) => {
              if (date) onChange(date);
            }}
            themeVariant={theme.dark ? 'dark' : 'light'}
            accentColor={theme.colors.primary}
          />
          <Pressable
            onPress={() => setOpen(false)}
            style={[styles.iosDone, { backgroundColor: theme.colors.primary }]}
          >
            <Text variant="labelLarge" style={{ color: theme.colors.onPrimary, fontWeight: '700' }}>
              OK
            </Text>
          </Pressable>
        </View>
      ) : null}

      {open && Platform.OS === 'android' ? (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display="default"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={handleNativeChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    minHeight: layout.fieldHeight,
  },
  textBlock: { flex: 1, gap: 2 },
  iosPicker: {
    marginTop: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  iosDone: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
  },
});
