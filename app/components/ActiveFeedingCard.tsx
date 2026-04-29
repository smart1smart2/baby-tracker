import { useTranslation } from 'react-i18next';

import { useStopFeeding } from '@/features/feedings/queries';
import { feedingKindKey } from '@/features/feedings/labels';
import type { Feeding } from '@/types/domain';

import { ActiveTimerCard } from './ActiveTimerCard';

type Props = {
  feeding: Feeding;
  onPress?: () => void;
};

export function ActiveFeedingCard({ feeding, onPress }: Props) {
  const { t } = useTranslation();
  const stopFeeding = useStopFeeding();

  return (
    <ActiveTimerCard
      icon="baby-bottle-outline"
      label={t(feedingKindKey(feeding.kind))}
      startedAt={feeding.started_at}
      stopLabel={t('feedings.new.stopNow')}
      stopping={stopFeeding.isPending}
      onStop={() => stopFeeding.mutate(feeding.id)}
      onPress={onPress}
    />
  );
}
