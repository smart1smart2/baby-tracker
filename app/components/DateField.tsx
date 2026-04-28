import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { radii, spacing } from '@/constants';

type Props = {
  label: string;
  value: Date | null;
  placeholder?: string;
  onChange: (date: Date) => void;
  maximumDate?: Date;
  minimumDate?: Date;
};

/**
 * Date picker styled as a regular Paper TextInput so it sits in the form
 * with identical chrome to AppTextInput. The TextInput is non-editable; the
 * surrounding Pressable opens the native picker on tap.
 */
export function DateField({
  label,
  value,
  placeholder,
  onChange,
  maximumDate,
  minimumDate,
}: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const display = value ? format(value, 'd MMM yyyy') : '';

  const handleNativeChange = (event: DateTimePickerEvent, date?: Date) => {
    // Android dispatches `dismissed` on cancel and `set` on confirm — close in either case.
    if (Platform.OS === 'android') setOpen(false);
    if (event.type === 'set' && date) onChange(date);
  };

  return (
    <View>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
      >
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            value={display}
            placeholder={placeholder}
            editable={false}
            outlineStyle={{ borderRadius: radii.lg, borderWidth: 1.5 }}
            outlineColor={theme.colors.outlineVariant}
            activeOutlineColor={theme.colors.primary}
            style={{ backgroundColor: theme.colors.surface }}
            left={<TextInput.Icon icon="calendar-month-outline" />}
            right={<TextInput.Icon icon={open ? 'chevron-up' : 'chevron-down'} />}
          />
        </View>
      </Pressable>

      {open && Platform.OS === 'ios' ? (
        <View
          style={[
            styles.iosPicker,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.outlineVariant,
            },
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
            style={styles.iosCalendar}
          />
          <Pressable
            onPress={() => setOpen(false)}
            style={[styles.iosDone, { backgroundColor: theme.colors.primary }]}
          >
            <Text
              variant="labelLarge"
              style={{ color: theme.colors.onPrimary, fontWeight: '700' }}
            >
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
  iosPicker: {
    marginTop: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
    alignItems: 'center',
  },
  iosCalendar: {
    transform: [{ scale: 1.1 }],
  },
  iosDone: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
  },
});
