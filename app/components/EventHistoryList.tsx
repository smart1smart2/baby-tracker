import { Fragment, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { format, isToday, isYesterday } from 'date-fns';

import { EventListItem } from './EventListItem';
import { radii, shadows, spacing } from '@/constants';
import { useDateLocale } from '@/hooks/use-date-locale';
import type { EventItem } from '@/lib/events';

type Props = {
  events: EventItem[];
  emptyText: string;
};

/**
 * Chronological list of events grouped by day, with a date header for each
 * group. Newest first. Used by domain history screens.
 */
export function EventHistoryList({ events, emptyText }: Props) {
  const theme = useTheme();
  const { t } = useTranslation();
  const dateLocale = useDateLocale();

  const groups = useMemo(() => {
    const sorted = events
      .slice()
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
    const map = new Map<string, EventItem[]>();
    sorted.forEach((e) => {
      const key = format(e.occurredAt, 'yyyy-MM-dd');
      const list = map.get(key) ?? [];
      list.push(e);
      map.set(key, list);
    });
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      date: items[0].occurredAt,
      items,
    }));
  }, [events]);

  if (groups.length === 0) {
    return (
      <View
        style={[
          styles.emptyCard,
          shadows.sm,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}
        >
          {emptyText}
        </Text>
      </View>
    );
  }

  return (
    <>
      {groups.map((group) => (
        <Fragment key={group.key}>
          <Text
            variant="labelLarge"
            style={[styles.dayHeader, { color: theme.colors.onSurfaceVariant }]}
          >
            {isToday(group.date)
              ? t('home.today')
              : isYesterday(group.date)
                ? t('history.yesterday')
                : format(group.date, 'EEEE, d MMMM', { locale: dateLocale })}
          </Text>
          <View
            style={[
              styles.card,
              shadows.sm,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            {group.items.map((e, idx) => (
              <View key={e.id}>
                {idx > 0 ? (
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: theme.colors.outlineVariant },
                    ]}
                  />
                ) : null}
                <EventListItem
                  icon={e.icon}
                  tint={e.tint}
                  title={e.title}
                  subtitle={e.subtitle}
                  time={format(e.occurredAt, 'HH:mm')}
                />
              </View>
            ))}
          </View>
        </Fragment>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  dayHeader: { fontWeight: '700', marginTop: spacing.sm },
  card: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.xl,
  },
  divider: { height: StyleSheet.hairlineWidth },
  emptyCard: {
    padding: spacing.xl,
    borderRadius: radii.xl,
    alignItems: 'center',
  },
});
