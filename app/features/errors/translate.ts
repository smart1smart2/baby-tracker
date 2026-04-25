import type { AuthError, PostgrestError } from '@supabase/supabase-js';

export type FriendlyError = {
  /** i18next key for the headline message. */
  messageKey: string;
  /** i18next key for the secondary hint, if any. */
  hintKey?: string;
  /** Interpolation params for both message and hint. */
  params?: Record<string, string | number>;
  /** Original error string for logging / debugging. */
  raw?: string;
};

/**
 * Map any error coming from Supabase (Auth, PostgREST) or the network layer
 * to a translation key + optional hint key. The UI layer renders the keys
 * via `useTranslation()` so wording stays in sync across the locales.
 */
export function translateError(error: unknown): FriendlyError {
  if (!error) return { messageKey: 'errors.unknown' };

  if (error instanceof TypeError && /network|fetch/i.test(error.message)) {
    return {
      messageKey: 'errors.network',
      hintKey: 'errors.networkHint',
      raw: error.message,
    };
  }

  if (isAuthError(error)) return translateAuthError(error);
  if (isPostgrestError(error)) return translatePostgrestError(error);

  if (error instanceof Error) {
    return { messageKey: 'errors.generic', raw: error.message };
  }

  return { messageKey: 'errors.generic', raw: String(error) };
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
      messageKey: 'errors.auth.invalidCredentials',
      hintKey: 'errors.auth.invalidCredentialsHint',
      raw,
    };
  }

  if (code === 'email_not_confirmed' || lower.includes('email not confirmed')) {
    return {
      messageKey: 'errors.auth.emailNotConfirmed',
      hintKey: 'errors.auth.emailNotConfirmedHint',
      raw,
    };
  }

  if (
    code === 'user_already_exists' ||
    lower.includes('already registered') ||
    lower.includes('already been registered')
  ) {
    return {
      messageKey: 'errors.auth.userExists',
      hintKey: 'errors.auth.userExistsHint',
      raw,
    };
  }

  if (code === 'weak_password' || (lower.includes('password') && lower.includes('6 characters'))) {
    return {
      messageKey: 'errors.auth.weakPassword',
      hintKey: 'errors.auth.weakPasswordHint',
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
      messageKey: 'errors.auth.rateLimit',
      hintKey: 'errors.auth.rateLimitHint',
      raw,
    };
  }

  if (
    code === 'email_address_invalid' ||
    (lower.includes('email') && (lower.includes('invalid') || lower.includes('not valid')))
  ) {
    return {
      messageKey: 'errors.auth.emailInvalidServer',
      hintKey: 'errors.auth.emailInvalidServerHint',
      raw,
    };
  }

  if (code === 'otp_expired' || lower.includes('expired')) {
    return {
      messageKey: 'errors.auth.otpExpired',
      hintKey: 'errors.auth.otpExpiredHint',
      raw,
    };
  }

  if (status === 0 || lower.includes('network')) {
    return {
      messageKey: 'errors.auth.noConnection',
      hintKey: 'errors.networkHint',
      raw,
    };
  }

  return { messageKey: 'errors.generic', raw };
}

// -----------------------------------------------------------------------------
// PostgREST
// -----------------------------------------------------------------------------

function translatePostgrestError(error: PostgrestError): FriendlyError {
  const code = error.code ?? '';
  const message = (error.message ?? '').toLowerCase();
  const raw = error.message;

  if (code === '42501' || message.includes('row-level security')) {
    return { messageKey: 'errors.db.rls', hintKey: 'errors.db.rlsHint', raw };
  }
  if (code === '23505') {
    return { messageKey: 'errors.db.unique', hintKey: 'errors.db.uniqueHint', raw };
  }
  if (code === '23503') {
    return { messageKey: 'errors.db.fk', hintKey: 'errors.db.fkHint', raw };
  }
  if (code === '23502') {
    return { messageKey: 'errors.db.notNull', raw };
  }
  if (code === '23514') {
    return { messageKey: 'errors.db.check', hintKey: 'errors.db.checkHint', raw };
  }
  if (code === 'PGRST116') {
    return { messageKey: 'errors.db.notFound', raw };
  }

  return { messageKey: 'errors.db.generic', raw };
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
