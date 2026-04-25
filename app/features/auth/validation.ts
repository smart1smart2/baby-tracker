import type { FriendlyError } from '@/features/errors/translate';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;

export function validateEmail(email: string): FriendlyError | null {
  const trimmed = email.trim();
  if (!trimmed) return { messageKey: 'validation.emailRequired' };
  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      messageKey: 'validation.emailInvalid',
      hintKey: 'validation.emailInvalidHint',
    };
  }
  return null;
}

export function validatePassword(password: string): FriendlyError | null {
  if (!password) return { messageKey: 'validation.passwordRequired' };
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      messageKey: 'validation.passwordTooShort',
      hintKey: 'validation.passwordTooShortHint',
      params: { min: MIN_PASSWORD_LENGTH },
    };
  }
  return null;
}

export function validateFullName(name: string): FriendlyError | null {
  if (!name.trim()) return { messageKey: 'validation.nameRequired' };
  return null;
}
