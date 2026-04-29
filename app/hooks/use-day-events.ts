import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { enUS, uk } from 'date-fns/locale';

import { useDiapersForDay } from '@/features/diapers/queries';
import { useFeedingsForDay } from '@/features/feedings/queries';
import { useMeasurementsForDay } from '@/features/measurements/queries';
import { useSleepsForDay } from '@/features/sleeps/queries';
import {
  diaperToEvent,
  feedingToEvent,
  measurementToEvent,
  sleepToEvent,
  type EventItem,
} from '@/lib/events';

/**
 * Fetches one day's worth of events across every domain and merges them
 * into a single timeline sorted newest-first. Counts are exposed
 * separately so the home stats row can read counts without re-mapping.
 */
export function useDayEvents(childId: string | null, day: Date) {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'uk' ? uk : enUS;

  const { data: feedings = [] } = useFeedingsForDay(childId, day);
  const { data: sleeps = [] } = useSleepsForDay(childId, day);
  const { data: diapers = [] } = useDiapersForDay(childId, day);
  const { data: measurements = [] } = useMeasurementsForDay(childId, day);

  const events = useMemo<EventItem[]>(
    () =>
      [
        ...feedings.map((f) => feedingToEvent(f, t)),
        ...sleeps.map((s) => sleepToEvent(s, t, dateLocale)),
        ...diapers.map((d) => diaperToEvent(d, t)),
        ...measurements.map((m) => measurementToEvent(m, t)),
      ].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime()),
    [feedings, sleeps, diapers, measurements, t, dateLocale],
  );

  return {
    events,
    counts: {
      feedings: feedings.length,
      sleeps: sleeps.length,
      diapers: diapers.length,
    },
  };
}
