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
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { iconSizes, palette, radii, shadows, spacing } from '@/constants';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_DRAG_THRESHOLD = 80;
const DISMISS_VELOCITY = 800;

const SPRING_IN = { damping: 22, stiffness: 220, mass: 0.9 } as const;
const TIMING_OUT = { duration: 220, easing: Easing.in(Easing.cubic) } as const;
const BACKDROP_TIMING = { duration: 220, easing: Easing.out(Easing.cubic) } as const;

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
  const [mounted, setMounted] = useState(false);
  const [rendered, setRendered] = useState<ActionSheetOptions | null>(null);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (options) {
      setRendered(options);
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

  if (!mounted || !rendered) return null;

  const cancelLabel = rendered.cancelLabel ?? t('common.cancel');

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
                          backgroundColor: pressed
                            ? theme.colors.surfaceVariant
                            : 'transparent',
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
                          color: opt.destructive
                            ? palette.error
                            : theme.colors.onSurface,
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
