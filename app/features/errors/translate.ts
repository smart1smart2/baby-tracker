import type { AuthError, PostgrestError } from '@supabase/supabase-js';

export type FriendlyError = {
  /** Short user-facing message — first line. */
  message: string;
  /** Optional second line: a hint or recovery suggestion. */
  hint?: string;
  /** Original error string for logging / debugging. */
  raw?: string;
};

const NETWORK_HINT =
  "Перевір з'єднання з інтернетом і спробуй ще раз.";

/**
 * Translate any error coming from Supabase (Auth, PostgREST) or the network
 * layer into a localised user-facing message with an optional recovery hint.
 *
 * Pass-through for unknown errors keeps the original message so dev still has
 * a clue, while end-users at least see *something* in Ukrainian rather than
 * a cryptic English code.
 */
export function translateError(error: unknown): FriendlyError {
  if (!error) {
    return { message: 'Сталася невідома помилка' };
  }

  // Network failure (fetch threw, no response)
  if (error instanceof TypeError && /network|fetch/i.test(error.message)) {
    return {
      message: 'Не вдалося з’єднатися з сервером',
      hint: NETWORK_HINT,
      raw: error.message,
    };
  }

  if (isAuthError(error)) return translateAuthError(error);
  if (isPostgrestError(error)) return translatePostgrestError(error);

  if (error instanceof Error) {
    return { message: error.message, raw: error.message };
  }

  if (typeof error === 'string') {
    return { message: error, raw: error };
  }

  return { message: 'Сталася помилка. Спробуй ще раз.', raw: String(error) };
}

// -----------------------------------------------------------------------------
// Supabase Auth
// -----------------------------------------------------------------------------

function translateAuthError(error: AuthError): FriendlyError {
  const code = error.code ?? '';
  const status = error.status;
  const lower = (error.message ?? '').toLowerCase();
  const raw = error.message;

  if (code === 'invalid_credentials' || lower.includes('invalid login credentials')) {
    return {
      message: 'Невірний email або пароль',
      hint: 'Перевір, що CapsLock вимкнений, і спробуй знов.',
      raw,
    };
  }

  if (code === 'email_not_confirmed' || lower.includes('email not confirmed')) {
    return {
      message: 'Email ще не підтверджений',
      hint: 'Перевір пошту — ми надіслали тобі лист зі посиланням.',
      raw,
    };
  }

  if (
    code === 'user_already_exists' ||
    lower.includes('already registered') ||
    lower.includes('already been registered')
  ) {
    return {
      message: 'Цей email уже зареєстрований',
      hint: 'Спробуй увійти або відновити пароль.',
      raw,
    };
  }

  if (code === 'weak_password' || (lower.includes('password') && lower.includes('6 characters'))) {
    return {
      message: 'Пароль занадто простий',
      hint: 'Мінімум 6 символів. Краще додай літери різного регістру і цифри.',
      raw,
    };
  }

  if (
    code === 'over_request_rate_limit' ||
    code === 'over_email_send_rate_limit' ||
    lower.includes('rate limit') ||
    status === 429
  ) {
    return {
      message: 'Забагато спроб',
      hint: 'Зачекай кілька хвилин перед наступною спробою.',
      raw,
    };
  }

  if (
    code === 'email_address_invalid' ||
    (lower.includes('email') && (lower.includes('invalid') || lower.includes('not valid')))
  ) {
    return {
      message: 'Сервер не прийняв цю адресу',
      hint:
        'Generic-адреси (bob@, test@…) блокуються як антиспам. Використай реальну пошту або +суфікс.',
      raw,
    };
  }

  if (code === 'otp_expired' || lower.includes('expired')) {
    return {
      message: 'Посилання вже не дійсне',
      hint: 'Запитай новий лист для підтвердження.',
      raw,
    };
  }

  if (status === 0 || lower.includes('network')) {
    return {
      message: 'Немає з’єднання з сервером',
      hint: NETWORK_HINT,
      raw,
    };
  }

  return { message: error.message, raw };
}

// -----------------------------------------------------------------------------
// PostgREST (database mutations / queries)
// -----------------------------------------------------------------------------

function translatePostgrestError(error: PostgrestError): FriendlyError {
  const code = error.code ?? '';
  const message = (error.message ?? '').toLowerCase();
  const raw = error.message;

  // RLS denial
  if (code === '42501' || message.includes('row-level security')) {
    return {
      message: 'Немає доступу до цих даних',
      hint: 'Можливо, твоєї ролі не вистачає для цієї дії.',
      raw,
    };
  }

  // Unique constraint
  if (code === '23505') {
    return {
      message: 'Такий запис уже існує',
      hint: 'Перевір, чи не додавали ви це раніше.',
      raw,
    };
  }

  // Foreign key violation
  if (code === '23503') {
    return {
      message: 'Не знайдено пов’язаний запис',
      hint: 'Можливо, дитину чи інший об’єкт було видалено.',
      raw,
    };
  }

  // Not null violation
  if (code === '23502') {
    return {
      message: 'Не всі обов’язкові поля заповнені',
      raw,
    };
  }

  // Check constraint
  if (code === '23514') {
    return {
      message: 'Введене значення не пройшло перевірку',
      hint: 'Перевір формат і допустимі значення.',
      raw,
    };
  }

  // PGRST116 — single row expected, got 0
  if (code === 'PGRST116') {
    return { message: 'Запис не знайдено', raw };
  }

  return { message: error.message || 'Помилка бази даних', raw };
}

// -----------------------------------------------------------------------------
// Type guards
// -----------------------------------------------------------------------------

function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    typeof (error as { name: string }).name === 'string' &&
    (error as { name: string }).name.startsWith('Auth')
  );
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
}
