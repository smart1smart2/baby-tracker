import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { differenceInMonths } from 'date-fns';

import { ScreenContainer } from '@/components/ScreenContainer';
import { SectionLabel } from '@/components/SectionLabel';
import { iconSizes, palette, radii, shadows, spacing } from '@/constants';
import {
  AGE_BANDS,
  ageBandKey,
  categoryIcon,
  categoryTint,
  normalizeCategory,
  templateKey,
  type AgeBand,
} from '@/features/milestones/labels';
import {
  useChildMilestones,
  useMilestoneTemplates,
} from '@/features/milestones/queries';
import { useChild } from '@/features/children/queries';
import { useActiveChild } from '@/stores/activeChild';
import type { Milestone, MilestoneTemplate } from '@/types/domain';

type EnrichedTemplate = MilestoneTemplate & { mark: Milestone | null };

export default function MilestonesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const activeChildId = useActiveChild((s) => s.activeChildId);
  const { data: child } = useChild(activeChildId);
  const { data: templates = [], isLoading: templatesLoading } = useMilestoneTemplates();
  const { data: marks = [] } = useChildMilestones(activeChildId);

  const ageMonths = useMemo(() => {
    if (!child?.date_of_birth) return null;
    return differenceInMonths(new Date(), new Date(child.date_of_birth));
  }, [child?.date_of_birth]);

  const markByTemplate = useMemo(() => {
    const map = new Map<string, Milestone>();
    for (const m of marks) if (m.template_id) map.set(m.template_id, m);
    return map;
  }, [marks]);

  const grouped = useMemo(() => {
    const enriched: EnrichedTemplate[] = templates.map((tpl) => ({
      ...tpl,
      mark: markByTemplate.get(tpl.id) ?? null,
    }));
    const byBand = new Map<AgeBand['id'], EnrichedTemplate[]>();
    for (const band of AGE_BANDS) byBand.set(band.id, []);
    for (const tpl of enriched) {
      const band =
        AGE_BANDS.find(
          (b) =>
            tpl.expected_age_min_months >= b.minMonths &&
            tpl.expected_age_min_months < b.maxMonths,
        ) ?? AGE_BANDS[AGE_BANDS.length - 1];
      byBand.get(band.id)?.push(tpl);
    }
    return AGE_BANDS.map((band) => ({ band, items: byBand.get(band.id) ?? [] }));
  }, [templates, markByTemplate]);

  const dueNow = useMemo(() => {
    if (ageMonths == null) return [];
    return templates.filter(
      (tpl) =>
        ageMonths >= tpl.expected_age_min_months &&
        ageMonths <= tpl.expected_age_max_months &&
        !markByTemplate.has(tpl.id),
    );
  }, [templates, markByTemplate, ageMonths]);

  if (!activeChildId) {
    return (
      <ScreenContainer edges={[]}>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
        >
          {t('milestones.empty.noChild')}
        </Text>
      </ScreenContainer>
    );
  }

  if (templatesLoading) {
    return (
      <ScreenContainer edges={[]}>
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      </ScreenContainer>
    );
  }

  const cardStyle = [styles.card, shadows.sm, { backgroundColor: theme.colors.surface }];

  return (
    <ScreenContainer edges={[]}>
      {dueNow.length > 0 ? (
        <View style={[styles.dueCard, { backgroundColor: theme.colors.primaryContainer }]}>
          <View style={styles.dueHeader}>
            <MaterialCommunityIcons
              name="bell-ring-outline"
              size={iconSizes.md}
              color={theme.colors.onPrimaryContainer}
            />
            <Text
              variant="titleSmall"
              style={{ color: theme.colors.onPrimaryContainer, fontWeight: '700' }}
            >
              {t('milestones.dueNow.title', { count: dueNow.length })}
            </Text>
          </View>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onPrimaryContainer }}
          >
            {t('milestones.dueNow.message')}
          </Text>
        </View>
      ) : null}

      {grouped.map(({ band, items }) =>
        items.length === 0 ? null : (
          <View key={band.id}>
            <SectionLabel>{t(ageBandKey(band))}</SectionLabel>
            <View style={cardStyle}>
              {items.map((tpl, idx) => (
                <View key={tpl.id}>
                  {idx > 0 ? (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: theme.colors.outlineVariant },
                      ]}
                    />
                  ) : null}
                  <MilestoneRow
                    template={tpl}
                    achieved={Boolean(tpl.mark)}
                    onPress={() => router.push(`/milestones/${tpl.code}`)}
                  />
                </View>
              ))}
            </View>
          </View>
        ),
      )}
    </ScreenContainer>
  );
}

function MilestoneRow({
  template,
  achieved,
  onPress,
}: {
  template: MilestoneTemplate;
  achieved: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const category = normalizeCategory(template.category);
  const icon = categoryIcon(category);
  const tint = categoryTint(category);
  const titleFallback = template.title;
  const title = t(templateKey(template.code, 'title'), { defaultValue: titleFallback });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={[styles.iconWrap, { backgroundColor: tint }]}>
        <MaterialCommunityIcons name={icon} size={iconSizes.md} color={palette.white} />
      </View>
      <View style={styles.rowText}>
        <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
          {title}
        </Text>
      </View>
      <MaterialCommunityIcons
        name={achieved ? 'check-circle' : 'circle-outline'}
        size={iconSizes.lg}
        color={achieved ? theme.colors.primary : theme.colors.onSurfaceVariant}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: spacing.lg,
    borderRadius: radii.xl,
  },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: -spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  dueCard: {
    padding: spacing.lg,
    borderRadius: radii.xl,
    gap: spacing.xs,
  },
  dueHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  centered: { paddingVertical: spacing.xxxl, alignItems: 'center' },
});
