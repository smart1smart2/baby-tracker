import type { ComponentProps } from 'react';
import { format, formatDistanceStrict, parseISO } from 'date-fns';
import type { Locale } from 'date-fns';
import type { TFunction } from 'i18next';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

import { categoryColors } from '@/constants';
import { diaperKindIcon, diaperKindKey } from '@/features/diapers/labels';
import { feedingKindKey } from '@/features/feedings/labels';
import {
  measurementKindIcon,
  measurementKindKey,
} from '@/features/measurements/labels';
import type {
  Diaper,
  Feeding,
  GrowthMeasurement,
  Sleep,
} from '@/types/domain';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type EventItem = {
  id: string;
  occurredAt: Date;
  icon: IconName;
  tint: string;
  title: string;
  subtitle?: string;
};

export function feedingToEvent(f: Feeding, t: TFunction): EventItem {
  const kindLabel = t(feedingKindKey(f.kind));
  const amount = f.amount_ml
    ? t('feedings.amountWithUnit', { amount: f.amount_ml })
    : null;
  return {
    id: `f-${f.id}`,
    occurredAt: parseISO(f.started_at),
    icon: 'baby-bottle-outline',
    tint: categoryColors.feeding,
    title: t('feedings.event.title'),
    subtitle: amount ? `${kindLabel} · ${amount}` : kindLabel,
  };
}

export function sleepToEvent(s: Sleep, t: TFunction, locale: Locale): EventItem {
  const startedAt = parseISO(s.started_at);
  const endedAt = s.ended_at ? parseISO(s.ended_at) : null;
  const duration = formatDistanceStrict(startedAt, endedAt ?? new Date(), {
    locale,
    roundingMethod: 'floor',
  });
  const subtitle = endedAt
    ? `→ ${format(endedAt, 'HH:mm')} · ${duration}`
    : `${t('sleeps.event.ongoing')} · ${duration}`;
  return {
    id: `s-${s.id}`,
    occurredAt: startedAt,
    icon: 'sleep',
    tint: categoryColors.sleep,
    title: t('sleeps.event.title'),
    subtitle,
  };
}

export function diaperToEvent(d: Diaper, t: TFunction): EventItem {
  const kindLabel = t(diaperKindKey(d.kind));
  return {
    id: `d-${d.id}`,
    occurredAt: parseISO(d.occurred_at),
    icon: diaperKindIcon(d.kind),
    tint: categoryColors.diaper,
    title: t('diapers.event.title'),
    subtitle: d.notes ? `${kindLabel} · ${d.notes}` : kindLabel,
  };
}

export function measurementToEvent(m: GrowthMeasurement, t: TFunction): EventItem {
  return {
    id: `m-${m.id}`,
    occurredAt: parseISO(m.measured_at),
    icon: measurementKindIcon(m.kind),
    tint: categoryColors.growth,
    title: t('measurements.event.title'),
    subtitle: `${t(measurementKindKey(m.kind))}: ${m.value} ${m.unit}`,
  };
}
