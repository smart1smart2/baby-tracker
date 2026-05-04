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
  VACC_AGE_SLOTS,
  ageSlotKey,
  vaccineGroupKey,
  vaccineGroupTint,
  type VaccAgeSlot,
} from '@/features/vaccinations/labels';
import {
  useChildVaccinations,
  useVaccinationTemplates,
} from '@/features/vaccinations/queries';
import { useChild } from '@/features/children/queries';
import { useActiveChild } from '@/stores/activeChild';
import type { Vaccination, VaccinationTemplate } from '@/types/domain';

type EnrichedTemplate = VaccinationTemplate & { mark: Vaccination | null };

export default function VaccinationsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const activeChildId = useActiveChild((s) => s.activeChildId);
  const { data: child } = useChild(activeChildId);
  const { data: templates = [], isLoading: templatesLoading } = useVaccinationTemplates();
  const { data: marks = [] } = useChildVaccinations(activeChildId);

  const ageMonths = useMemo(() => {
    if (!child?.date_of_birth) return null;
    return differenceInMonths(new Date(), new Date(child.date_of_birth));
  }, [child?.date_of_birth]);

  const markByCode = useMemo(() => {
    const map = new Map<string, Vaccination>();
    for (const m of marks) map.set(m.vaccine_code, m);
    return map;
  }, [marks]);

  const grouped = useMemo(() => {
    const enriched: EnrichedTemplate[] = templates.map((tpl) => ({
      ...tpl,
      mark: markByCode.get(tpl.code) ?? null,
    }));
    const bySlot = new Map<VaccAgeSlot['id'], EnrichedTemplate[]>();
    for (const slot of VACC_AGE_SLOTS) bySlot.set(slot.id, []);
    for (const tpl of enriched) {
      const slot =
        [...VACC_AGE_SLOTS].reverse().find((s) => tpl.expected_age_min_months >= s.month) ??
        VACC_AGE_SLOTS[0];
      bySlot.get(slot.id)?.push(tpl);
    }
    return VACC_AGE_SLOTS.map((slot) => ({ slot, items: bySlot.get(slot.id) ?? [] }));
  }, [templates, markByCode]);

  const dueNow = useMemo(() => {
    if (ageMonths == null) return [];
    return templates.filter(
      (tpl) =>
        ageMonths >= tpl.expected_age_min_months &&
        ageMonths <= tpl.expected_age_max_months &&
        !markByCode.has(tpl.code),
    );
  }, [templates, markByCode, ageMonths]);

  if (!activeChildId) {
    return (
      <ScreenContainer edges={[]}>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
        >
          {t('vaccinations.empty.noChild')}
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

  if (templates.length === 0) {
    return (
      <ScreenContainer edges={[]}>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
        >
          {t('vaccinations.empty.noTemplates')}
        </Text>
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
              {t('vaccinations.dueNow.title', { count: dueNow.length })}
            </Text>
          </View>
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onPrimaryContainer }}
          >
            {t('vaccinations.dueNow.message')}
          </Text>
        </View>
      ) : null}

      {grouped.map(({ slot, items }) =>
        items.length === 0 ? null : (
          <View key={slot.id}>
            <SectionLabel>{t(ageSlotKey(slot))}</SectionLabel>
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
                  <VaccinationRow
                    template={tpl}
                    achieved={Boolean(tpl.mark)}
                    onPress={() => router.push(`/vaccinations/${tpl.code}`)}
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

function VaccinationRow({
  template,
  achieved,
  onPress,
}: {
  template: VaccinationTemplate;
  achieved: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const tint = vaccineGroupTint(template.group_code);
  const groupName = t(vaccineGroupKey(template.group_code), { defaultValue: template.name });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={groupName}
    >
      <View style={[styles.iconWrap, { backgroundColor: tint }]}>
        <MaterialCommunityIcons name="needle" size={iconSizes.md} color={palette.white} />
      </View>
      <View style={styles.rowText}>
        <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
          {groupName}
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
