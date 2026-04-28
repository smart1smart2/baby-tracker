import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { palette, radii, spacing } from '@/constants';

import { BottomSheet } from './BottomSheet';

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmSheet
        options={options}
        onCancel={() => close(false)}
        onConfirm={() => close(true)}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}

type SheetProps = {
  options: ConfirmOptions | null;
  onCancel: () => void;
  onConfirm: () => void;
};

function ConfirmSheet({ options, onCancel, onConfirm }: SheetProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  // Latch the most recent options so content keeps rendering during the
  // close animation after the consumer sets options back to null.
  const [rendered, setRendered] = useState<ConfirmOptions | null>(null);

  useEffect(() => {
    if (options) setRendered(options);
  }, [options]);

  if (!rendered) return null;

  const cancelLabel = rendered.cancelLabel ?? t('common.cancel');
  const confirmLabel = rendered.confirmLabel ?? t('common.confirm');
  const confirmColor = rendered.destructive ? palette.error : theme.colors.primary;

  return (
    <BottomSheet visible={Boolean(options)} onDismiss={onCancel}>
      <View style={styles.content}>
        <Text
          variant="titleLarge"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          {rendered.title}
        </Text>
        {rendered.message ? (
          <Text
            variant="bodyMedium"
            style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
          >
            {rendered.message}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onCancel}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {cancelLabel}
          </Button>
          <Button
            mode="contained"
            onPress={onConfirm}
            buttonColor={confirmColor}
            textColor={theme.colors.onPrimary}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {confirmLabel}
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.sm, paddingBottom: spacing.lg },
  title: { fontWeight: '700' },
  message: { lineHeight: 22 },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: { flex: 1, borderRadius: radii.lg },
  buttonContent: { paddingVertical: spacing.xs },
});
