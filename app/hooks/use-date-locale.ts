import { useTranslation } from 'react-i18next';
import { enUS, uk } from 'date-fns/locale';
import type { Locale } from 'date-fns';

/**
 * Resolves the active i18next language to a date-fns Locale so date helpers
 * (`format`, `formatDistanceStrict`, etc.) match the rest of the UI. Defaults
 * to English; only Ukrainian gets a localized override today.
 */
export function useDateLocale(): Locale {
  const { i18n } = useTranslation();
  return i18n.language === 'uk' ? uk : enUS;
}
