import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { EventHistoryList } from '@/components/EventHistoryList';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useSleepsInRange } from '@/features/sleeps/queries';
import { useDateLocale } from '@/hooks/use-date-locale';
import { useLastDaysRange } from '@/hooks/use-last-days-range';
import { sleepToEvent } from '@/lib/events';
import { useActiveChild } from '@/stores/activeChild';

const RANGE_DAYS = 30;

export default function SleepsHistoryScreen() {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const activeChildId = useActiveChild((s) => s.activeChildId);
  const { from, to } = useLastDaysRange(RANGE_DAYS);
  const { data: sleeps = [] } = useSleepsInRange(activeChildId, from, to);
  const events = useMemo(
    () => sleeps.map((s) => sleepToEvent(s, t, dateLocale)),
    [sleeps, t, dateLocale],
  );

  return (
    <ScreenContainer edges={[]}>
      <EventHistoryList events={events} emptyText={t('history.empty')} />
    </ScreenContainer>
  );
}
