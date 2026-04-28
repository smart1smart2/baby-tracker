import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { iconSizes, radii, shadows, spacing } from '@/constants';
import { formatAge } from '@/lib/age';
import type { Child } from '@/types/domain';

import { ChildAvatar } from './ChildAvatar';

type Props = {
  children: Child[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
};

const HERO_AVATAR = 72;
const HERO_RING = 3;
const PILL_AVATAR = 44;
const RING_PADDING = 4;
const RING_BORDER = 2;

/**
 * "Data surface" pair to the gradient HeroCard: white background with brand
 * violet accents (decorative tint blob, ringed avatar, violet pill ring) so it
 * reads as part of the same surface family without stacking two gradients.
 */
export function ActiveChildPanel({ children, activeId, onSelect, onAdd }: Props) {
  const theme = useTheme();
  const { t, i18n } = useTranslation();

  const active = children.find((c) => c.id === activeId) ?? children[0] ?? null;
  if (!active) return null;

  return (
    <View style={[styles.card, shadows.sm, { backgroundColor: theme.colors.surface }]}>
      <View
        pointerEvents="none"
        style={[styles.decor, { backgroundColor: theme.colors.primaryContainer }]}
      />

      <View style={styles.heroRow}>
        <View style={[styles.avatarRing, { borderColor: theme.colors.primary }]}>
          <ChildAvatar child={active} size={HERO_AVATAR} />
        </View>
        <Animated.View
          key={active.id}
          entering={FadeIn.duration(200).easing(Easing.out(Easing.cubic))}
          exiting={FadeOut.duration(150)}
          style={styles.heroText}
        >
          <Text
            variant="labelSmall"
            style={[styles.heroLabel, { color: theme.colors.primary }]}
          >
            {t('home.activeChild')}
          </Text>
          <Text
            variant="headlineSmall"
            numberOfLines={1}
            style={[styles.heroName, { color: theme.colors.onSurface }]}
          >
            {active.full_name}
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {formatAge(active.date_of_birth, t)}
          </Text>
        </Animated.View>
      </View>

      {children.length > 1 || onAdd ? (
        <>
          <View
            style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillRow}
            key={i18n.language}
          >
            {children.map((c) => (
              <SwitchPill
                key={c.id}
                child={c}
                isActive={c.id === active.id}
                onPress={() => onSelect(c.id)}
              />
            ))}
            <Pressable
              onPress={onAdd}
              style={[
                styles.addPill,
                {
                  backgroundColor: theme.colors.primaryContainer,
                  borderColor: theme.colors.primary,
                },
              ]}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name="plus"
                size={iconSizes.lg}
                color={theme.colors.primary}
              />
            </Pressable>
          </ScrollView>
        </>
      ) : null}
    </View>
  );
}

type PillProps = {
  child: Child;
  isActive: boolean;
  onPress: () => void;
};

function SwitchPill({ child, isActive, onPress }: PillProps) {
  const theme = useTheme();
  const scale = useSharedValue(isActive ? 1.06 : 1);
  const ringOpacity = useSharedValue(isActive ? 1 : 0);
  const inactiveOpacity = useSharedValue(isActive ? 1 : 0.55);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.06 : 1, {
      damping: 14,
      stiffness: 220,
      mass: 0.9,
    });
    ringOpacity.value = withTiming(isActive ? 1 : 0, { duration: 200 });
    inactiveOpacity.value = withTiming(isActive ? 1 : 0.55, { duration: 200 });
  }, [isActive, scale, ringOpacity, inactiveOpacity]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: scale.value }],
  }));
  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: inactiveOpacity.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      style={styles.pillSlot}
      accessibilityState={{ selected: isActive }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pillRing,
          { borderColor: theme.colors.primary },
          ringStyle,
        ]}
      />
      <Animated.View style={avatarStyle}>
        <ChildAvatar child={child} size={PILL_AVATAR} />
      </Animated.View>
    </Pressable>
  );
}

const RING_SIZE = PILL_AVATAR + RING_PADDING * 2 + RING_BORDER * 2;
const HERO_RING_SIZE = HERO_AVATAR + HERO_RING * 2;

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    borderRadius: radii.xxl,
    gap: spacing.md,
    overflow: 'hidden',
  },
  decor: {
    position: 'absolute',
    right: -40,
    top: -40,
    width: 140,
    height: 140,
    borderRadius: radii.pill,
    opacity: 0.55,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  avatarRing: {
    width: HERO_RING_SIZE,
    height: HERO_RING_SIZE,
    borderRadius: radii.pill,
    borderWidth: HERO_RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1, gap: 2 },
  heroLabel: { fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  heroName: { fontWeight: '700' },
  divider: { height: StyleSheet.hairlineWidth, marginTop: spacing.xs },
  pillRow: {
    paddingVertical: spacing.xs,
    gap: spacing.md,
    alignItems: 'center',
  },
  pillSlot: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillRing: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: radii.pill,
    borderWidth: RING_BORDER,
  },
  addPill: {
    width: PILL_AVATAR,
    height: PILL_AVATAR,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
