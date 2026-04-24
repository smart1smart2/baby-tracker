import { differenceInDays, differenceInMonths, differenceInYears, parseISO } from 'date-fns';

export function formatAge(dateOfBirth: string): string {
  const dob = parseISO(dateOfBirth);
  const now = new Date();
  const days = differenceInDays(now, dob);

  if (days < 0) return 'ще не народився';
  if (days < 14) return `${days} ${plural(days, 'день', 'дні', 'днів')}`;

  const weeks = Math.floor(days / 7);
  if (weeks < 12) return `${weeks} ${plural(weeks, 'тиждень', 'тижні', 'тижнів')}`;

  const months = differenceInMonths(now, dob);
  if (months < 24) return `${months} ${plural(months, 'місяць', 'місяці', 'місяців')}`;

  const years = differenceInYears(now, dob);
  const remMonths = months - years * 12;
  const yearPart = `${years} ${plural(years, 'рік', 'роки', 'років')}`;
  if (remMonths === 0) return yearPart;
  return `${yearPart} ${remMonths} ${plural(remMonths, 'місяць', 'місяці', 'місяців')}`;
}

function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
