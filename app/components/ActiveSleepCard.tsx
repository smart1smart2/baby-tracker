import { useTranslation } from 'react-i18next';

import { useStopSleep } from '@/features/sleeps/queries';
import type { Sleep } from '@/types/domain';

import { ActiveTimerCard } from './ActiveTimerCard';

type Props = {
  sleep: Sleep;
  onPress?: () => void;
};

export function ActiveSleepCard({ sleep, onPress }: Props) {
  const { t } = useTranslation();
  const stopSleep = useStopSleep();

  return (
    <ActiveTimerCard
      icon="sleep"
      label={t('sleeps.new.activeSleep')}
      startedAt={sleep.started_at}
      stopLabel={t('sleeps.new.stopNow')}
      stopping={stopSleep.isPending}
      onStop={() => stopSleep.mutate(sleep.id)}
      onPress={onPress}
    />
  );
}
