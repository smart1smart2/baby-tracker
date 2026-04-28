import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { iconSizes, radii, shadows, spacing } from '@/constants';
import { formatAge } from '@/lib/age';
import type { Child } from '@/types/domain';

import { ChildAvatar } from './ChildAvatar';

const HERO_AVATAR = 72;

const PILL_AVATAR = 44;
const PILL_RING_BORDER = 2;
const PILL_RING_GAP = 4;
const PILL_SLOT = PILL_AVATAR + (PILL_RING_BORDER + PILL_RING_GAP) * 2;

type Props = {
  children: Child[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
};

/**
 * White-surface companion to the gradient HeroCard: the focused child as a
 * "hero" row, a horizontal switcher for siblings, and a primary-tinted
 * add affordance. Brand accents (violet ring, decorative tint blob) tie it
 * back to the hero without stacking another gradient.
 */
export function ActiveChildPanel({ children, activeId, onSelect, onAdd, onEdit }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();

  const active = children.find((c) => c.id === activeId) ?? children[0] ?? null;
  if (!active) return null;

  const hasSiblings = children.length > 1;

  return (
    <View
      style={[
        styles.card,
        shadows.sm,
        { backgroundColor: theme.colors.surface },
      ]}
    >
      <View
        pointerEvents="none"
        style={[styles.decor, { backgroundColor: theme.colors.primaryContainer }]}
      />

      <View style={styles.heroRow}>
        <ChildAvatar child={active} size={HERO_AVATAR} />
        <Animated.View
          key={active.id}
          entering={FadeIn.duration(200).easing(Easing.out(Easing.cubic))}
          exiting={FadeOut.duration(150)}
          style={styles.heroText}
        >
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
          {active.notes ? (
            <Text
              variant="bodySmall"
              numberOfLines={2}
              style={[styles.notes, { color: theme.colors.onSurfaceVariant }]}
            >
              {active.notes}
            </Text>
          ) : null}
        </Animated.View>
        <Pressable
          onPress={() => onEdit(active.id)}
          hitSlop={spacing.sm}
          style={[
            styles.editButton,
            { backgroundColor: theme.colors.primaryContainer },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t('children.edit.screenTitle')}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={iconSizes.md}
            color={theme.colors.primary}
          />
        </Pressable>
      </View>

      <View
        style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
      >
        {hasSiblings
          ? children.map((c) => (
              <SwitchPill
                key={c.id}
                child={c}
                isActive={c.id === active.id}
                onPress={() => onSelect(c.id)}
              />
            ))
          : null}
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
          accessibilityLabel={t('home.addAnotherChild')}
        >
          <MaterialCommunityIcons
            name="plus"
            size={iconSizes.lg}
            color={theme.colors.primary}
          />
        </Pressable>
      </ScrollView>
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
  const progress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isActive ? 1 : 0, {
      damping: 16,
      stiffness: 220,
      mass: 0.9,
    });
  }, [isActive, progress]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));
  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 1], [1, 1.06]) }],
    opacity: interpolate(progress.value, [0, 1], [0.7, 1]),
  }));

  return (
    <Pressable
      onPress={onPress}
      style={styles.pillSlot}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={child.full_name}
    >
      <Animated.View
        pointerEvents="none"
        style={[styles.pillRing, { borderColor: theme.colors.primary }, ringStyle]}
      />
      <Animated.View style={avatarStyle}>
        <ChildAvatar child={child} size={PILL_AVATAR} />
      </Animated.View>
    </Pressable>
  );
}

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
  heroText: { flex: 1, gap: spacing.xs },
  heroName: { fontWeight: '700' },
  notes: { fontStyle: 'italic', marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginTop: spacing.xs },
  pillRow: {
    paddingVertical: spacing.xs,
    gap: spacing.md,
    alignItems: 'center',
  },
  pillSlot: {
    width: PILL_SLOT,
    height: PILL_SLOT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillRing: {
    position: 'absolute',
    width: PILL_SLOT,
    height: PILL_SLOT,
    borderRadius: radii.pill,
    borderWidth: PILL_RING_BORDER,
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
  editButton: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
