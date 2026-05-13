import { useTranslation } from 'react-i18next';
import { enUS, uk } from 'date-fns/locale';
import type { Locale } from 'date-fns';

export function useDateLocale(): Locale {
  const { i18n } = useTranslation();
  return i18n.language === 'uk' ? uk : enUS;
}
