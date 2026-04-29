import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { EventHistoryList } from '@/components/EventHistoryList';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useDiapersInRange } from '@/features/diapers/queries';
import { useLastDaysRange } from '@/hooks/use-last-days-range';
import { diaperToEvent } from '@/lib/events';
import { useActiveChild } from '@/stores/activeChild';

const RANGE_DAYS = 30;

export default function DiapersHistoryScreen() {
  const { t } = useTranslation();
  const activeChildId = useActiveChild((s) => s.activeChildId);
  const { from, to } = useLastDaysRange(RANGE_DAYS);
  const { data: diapers = [] } = useDiapersInRange(activeChildId, from, to);
  const events = useMemo(() => diapers.map((d) => diaperToEvent(d, t)), [diapers, t]);

  return (
    <ScreenContainer edges={[]}>
      <EventHistoryList events={events} emptyText={t('history.empty')} />
    </ScreenContainer>
  );
}
