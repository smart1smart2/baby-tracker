import { differenceInDays, differenceInMonths, differenceInYears, parseISO } from 'date-fns';
import type { TFunction } from 'i18next';

/**
 * Localised age formatter. Accepts an i18next `t` function so plural rules
 * pick the correct form for the active language (English: one/other,
 * Ukrainian: one/few/many/other).
 */
export function formatAge(dateOfBirth: string, t: TFunction): string {
  const dob = parseISO(dateOfBirth);
  const now = new Date();
  const days = differenceInDays(now, dob);

  if (days < 0) return t('age.notBornYet');
  if (days < 14) return t('age.days', { count: days });

  const weeks = Math.floor(days / 7);
  if (weeks < 12) return t('age.weeks', { count: weeks });

  const months = differenceInMonths(now, dob);
  if (months < 24) return t('age.months', { count: months });

  const years = differenceInYears(now, dob);
  const remMonths = months - years * 12;
  const yearPart = t('age.years', { count: years });
  if (remMonths === 0) return yearPart;
  return `${yearPart} ${t('age.months', { count: remMonths })}`;
}
