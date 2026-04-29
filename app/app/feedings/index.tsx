import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { EventHistoryList } from '@/components/EventHistoryList';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useFeedingsInRange } from '@/features/feedings/queries';
import { useLastDaysRange } from '@/hooks/use-last-days-range';
import { feedingToEvent } from '@/lib/events';
import { useActiveChild } from '@/stores/activeChild';

const RANGE_DAYS = 30;

export default function FeedingsHistoryScreen() {
  const { t } = useTranslation();
  const activeChildId = useActiveChild((s) => s.activeChildId);
  const { from, to } = useLastDaysRange(RANGE_DAYS);
  const { data: feedings = [] } = useFeedingsInRange(activeChildId, from, to);
  const events = useMemo(() => feedings.map((f) => feedingToEvent(f, t)), [feedings, t]);

  return (
    <ScreenContainer edges={[]}>
      <EventHistoryList events={events} emptyText={t('history.empty')} />
    </ScreenContainer>
  );
}
