import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDiapersForDay } from '@/features/diapers/queries';
import { useFeedingsForDay } from '@/features/feedings/queries';
import { useMeasurementsForDay } from '@/features/measurements/queries';
import {
  useMilestoneTemplates,
  useMilestonesForDay,
} from '@/features/milestones/queries';
import { useSleepsForDay } from '@/features/sleeps/queries';
import { useDateLocale } from '@/hooks/use-date-locale';
import {
  diaperToEvent,
  feedingToEvent,
  measurementToEvent,
  milestoneToEvent,
  sleepToEvent,
  type EventItem,
} from '@/lib/events';

/**
 * Fetches one day's worth of events across every domain and merges them
 * into a single timeline sorted newest-first. Counts are exposed
 * separately so the home stats row can read counts without re-mapping.
 */
export function useDayEvents(childId: string | null, day: Date) {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();

  const { data: feedings = [] } = useFeedingsForDay(childId, day);
  const { data: sleeps = [] } = useSleepsForDay(childId, day);
  const { data: diapers = [] } = useDiapersForDay(childId, day);
  const { data: measurements = [] } = useMeasurementsForDay(childId, day);
  const { data: milestones = [] } = useMilestonesForDay(childId, day);
  const { data: templates = [] } = useMilestoneTemplates();

  const events = useMemo<EventItem[]>(() => {
    const tplById = new Map(templates.map((tpl) => [tpl.id, tpl]));
    return [
      ...feedings.map((f) => feedingToEvent(f, t)),
      ...sleeps.map((s) => sleepToEvent(s, t, dateLocale)),
      ...diapers.map((d) => diaperToEvent(d, t)),
      ...measurements.map((m) => measurementToEvent(m, t)),
      ...milestones.map((mark) =>
        milestoneToEvent(mark, mark.template_id ? tplById.get(mark.template_id) ?? null : null, t),
      ),
    ].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }, [feedings, sleeps, diapers, measurements, milestones, templates, t, dateLocale]);

  return {
    events,
    counts: {
      feedings: feedings.length,
      sleeps: sleeps.length,
      diapers: diapers.length,
    },
  };
}
