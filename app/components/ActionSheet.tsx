import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { iconSizes, palette, radii, spacing } from '@/constants';

import { BottomSheet } from './BottomSheet';

export type ActionSheetOption = {
  key: string;
  label: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  destructive?: boolean;
  disabled?: boolean;
};

export type ActionSheetOptions = {
  title?: string;
  message?: string;
  options: ActionSheetOption[];
  cancelLabel?: string;
};

type ActionSheetContextValue = {
  show: (options: ActionSheetOptions) => Promise<string | null>;
};

const ActionSheetContext = createContext<ActionSheetContextValue | null>(null);

export function ActionSheetProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ActionSheetOptions | null>(null);
  const resolverRef = useRef<((value: string | null) => void) | null>(null);

  const show = useCallback((next: ActionSheetOptions) => {
    setOptions(next);
    return new Promise<string | null>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = useCallback((result: string | null) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  return (
    <ActionSheetContext.Provider value={{ show }}>
      {children}
      <Sheet options={options} onCancel={() => close(null)} onSelect={(key) => close(key)} />
    </ActionSheetContext.Provider>
  );
}

export function useActionSheet() {
  const ctx = useContext(ActionSheetContext);
  if (!ctx) throw new Error('useActionSheet must be used within ActionSheetProvider');
  return ctx.show;
}

type SheetProps = {
  options: ActionSheetOptions | null;
  onCancel: () => void;
  onSelect: (key: string) => void;
};

function Sheet({ options, onCancel, onSelect }: SheetProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [rendered, setRendered] = useState<ActionSheetOptions | null>(null);

  useEffect(() => {
    if (options) setRendered(options);
  }, [options]);

  if (!rendered) return null;

  const cancelLabel = rendered.cancelLabel ?? t('common.cancel');

  return (
    <BottomSheet visible={Boolean(options)} onDismiss={onCancel}>
      <View style={styles.content}>
        {rendered.title ? (
          <Text
            variant="titleLarge"
            style={[styles.title, { color: theme.colors.onSurface }]}
          >
            {rendered.title}
          </Text>
        ) : null}
        {rendered.message ? (
          <Text
            variant="bodyMedium"
            style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
          >
            {rendered.message}
          </Text>
        ) : null}

        <View style={styles.actions}>
          {rendered.options.map((opt) => (
            <Pressable
              key={opt.key}
              disabled={opt.disabled}
              onPress={() => onSelect(opt.key)}
              style={({ pressed }) => [
                styles.option,
                {
                  backgroundColor: pressed ? theme.colors.surfaceVariant : 'transparent',
                  opacity: opt.disabled ? 0.4 : 1,
                },
              ]}
            >
              {opt.icon ? (
                <MaterialCommunityIcons
                  name={opt.icon}
                  size={iconSizes.lg}
                  color={opt.destructive ? palette.error : theme.colors.primary}
                />
              ) : null}
              <Text
                variant="bodyLarge"
                style={{
                  color: opt.destructive ? palette.error : theme.colors.onSurface,
                  fontWeight: '600',
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Button
          mode="outlined"
          onPress={onCancel}
          style={styles.cancel}
          contentStyle={styles.cancelContent}
        >
          {cancelLabel}
        </Button>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.lg },
  title: { fontWeight: '700' },
  message: { marginTop: spacing.xs, lineHeight: 22 },
  actions: { marginTop: spacing.lg, gap: spacing.xs },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
  },
  cancel: { marginTop: spacing.lg, borderRadius: radii.lg },
  cancelContent: { paddingVertical: spacing.xs },
});
