import { useEffect, useState, type ReactNode } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
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

import { palette, radii, shadows, spacing } from '@/constants';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_DRAG_THRESHOLD = 80;
const DISMISS_VELOCITY = 800;

const SPRING_IN = { damping: 22, stiffness: 220, mass: 0.9 } as const;
const TIMING_OUT = { duration: 220, easing: Easing.in(Easing.cubic) } as const;
const BACKDROP_TIMING = { duration: 220, easing: Easing.out(Easing.cubic) } as const;

type Props = {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
};

/**
 * Animated bottom sheet over a `Modal` with backdrop dismiss + drag-to-close.
 * Slides up on `visible: true`, plays the close animation then unmounts when
 * `visible: false`. Consumer renders content inside.
 */
export function BottomSheet({ visible, onDismiss, children }: Props) {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.value = withSpring(0, SPRING_IN);
      backdropOpacity.value = withTiming(1, BACKDROP_TIMING);
    } else if (mounted) {
      backdropOpacity.value = withTiming(0, BACKDROP_TIMING);
      translateY.value = withTiming(SCREEN_HEIGHT, TIMING_OUT, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
  }, [visible, mounted, translateY, backdropOpacity]);

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
        runOnJS(onDismiss)();
      } else {
        translateY.value = withSpring(0, SPRING_IN);
      }
    });

  if (!mounted) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onDismiss}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
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
            <SafeAreaView edges={['bottom']}>{children}</SafeAreaView>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: palette.scrim },
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
});
