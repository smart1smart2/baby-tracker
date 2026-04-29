import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { EventHistoryList } from '@/components/EventHistoryList';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useMeasurements } from '@/features/measurements/queries';
import { measurementToEvent } from '@/lib/events';
import { useActiveChild } from '@/stores/activeChild';

export default function MeasurementsHistoryScreen() {
  const { t } = useTranslation();
  const activeChildId = useActiveChild((s) => s.activeChildId);
  const { data: measurements = [] } = useMeasurements(activeChildId);
  const events = useMemo(
    () => measurements.map((m) => measurementToEvent(m, t)),
    [measurements, t],
  );

  return (
    <ScreenContainer edges={[]}>
      <EventHistoryList events={events} emptyText={t('history.empty')} />
    </ScreenContainer>
  );
}
