import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Dimensions, Modal, StyleSheet, View, Pressable } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { palette, radii, shadows, spacing } from '@/constants';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_DRAG_THRESHOLD = 80;
const DISMISS_VELOCITY = 800;

const SPRING_IN = { damping: 22, stiffness: 220, mass: 0.9 } as const;
const TIMING_OUT = { duration: 220, easing: Easing.in(Easing.cubic) } as const;
const BACKDROP_TIMING = { duration: 220, easing: Easing.out(Easing.cubic) } as const;

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

  // Mount state lags behind `options` so we can play the close animation
  // before unmounting the portal contents.
  const [mounted, setMounted] = useState(false);
  const [renderedOptions, setRenderedOptions] = useState<ConfirmOptions | null>(null);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (options) {
      setRenderedOptions(options);
      setMounted(true);
      translateY.value = withSpring(0, SPRING_IN);
      backdropOpacity.value = withTiming(1, BACKDROP_TIMING);
    } else if (mounted) {
      backdropOpacity.value = withTiming(0, BACKDROP_TIMING);
      translateY.value = withTiming(SCREEN_HEIGHT, TIMING_OUT, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [options, mounted, translateY, backdropOpacity]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));

  const pan = Gesture.Pan()
    .activeOffsetY(8)
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DRAG_THRESHOLD || e.velocityY > DISMISS_VELOCITY) {
        runOnJS(onCancel)();
      } else {
        translateY.value = withSpring(0, SPRING_IN);
      }
    });

  if (!mounted || !renderedOptions) return null;

  const cancelLabel = renderedOptions.cancelLabel ?? t('common.cancel');
  const confirmLabel = renderedOptions.confirmLabel ?? t('common.confirm');
  const confirmColor = renderedOptions.destructive ? palette.error : theme.colors.primary;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        </Animated.View>

        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.sheet,
              shadows.xl,
              { backgroundColor: theme.colors.surface },
              sheetStyle,
            ]}
          >
            <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />
            <SafeAreaView edges={['bottom']}>
              <View style={styles.content}>
                <Text
                  variant="titleLarge"
                  style={[styles.title, { color: theme.colors.onSurface }]}
                >
                  {renderedOptions.title}
                </Text>
                {renderedOptions.message ? (
                  <Text
                    variant="bodyMedium"
                    style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
                  >
                    {renderedOptions.message}
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
            </SafeAreaView>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(15, 12, 35, 0.55)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radii.pill,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    opacity: 0.6,
  },
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
