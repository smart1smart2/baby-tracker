import type { DiaperKind } from '@/types/domain';

export const DIAPER_KINDS: readonly DiaperKind[] = ['wet', 'dirty', 'mixed', 'dry'] as const;

const KEYS: Record<DiaperKind, string> = {
  wet: 'diapers.kinds.wet',
  dirty: 'diapers.kinds.dirty',
  mixed: 'diapers.kinds.mixed',
  dry: 'diapers.kinds.dry',
};

const ICONS: Record<DiaperKind, 'water-outline' | 'emoticon-poop-outline' | 'water-sync' | 'check-circle-outline'> = {
  wet: 'water-outline',
  dirty: 'emoticon-poop-outline',
  mixed: 'water-sync',
  dry: 'check-circle-outline',
};

export const diaperKindKey = (kind: DiaperKind) => KEYS[kind];
export const diaperKindIcon = (kind: DiaperKind) => ICONS[kind];
