import type { FriendlyError } from '@/features/errors/translate';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;

export function validateEmail(email: string): FriendlyError | null {
  const trimmed = email.trim();
  if (!trimmed) return { message: 'Введи email' };
  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      message: 'Email виглядає некоректним',
      hint: 'Перевір, що адреса має формат you@example.com.',
    };
  }
  return null;
}

export function validatePassword(password: string): FriendlyError | null {
  if (!password) return { message: 'Введи пароль' };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      message: `Пароль закороткий`,
      hint: `Мінімум ${MIN_PASSWORD_LENGTH} символів.`,
    };
  }
  return null;
}

export function validateFullName(name: string): FriendlyError | null {
  if (!name.trim()) return { message: 'Введи своє ім’я' };
  return null;
}
