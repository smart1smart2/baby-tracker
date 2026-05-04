import { translateError } from '@/features/errors/translate';

describe('translateError', () => {
  test('returns errors.unknown for falsy input', () => {
    expect(translateError(null)).toEqual({ messageKey: 'errors.unknown' });
    expect(translateError(undefined)).toEqual({ messageKey: 'errors.unknown' });
  });

  test('detects network TypeErrors', () => {
    const out = translateError(new TypeError('Network request failed'));
    expect(out.messageKey).toBe('errors.network');
    expect(out.hintKey).toBe('errors.networkHint');
  });

  test('translates a Supabase auth invalid-credentials error', () => {
    // Mimic AuthError shape — supabase-js distinguishes auth errors by
    // their `name` field starting with "Auth".
    const err = Object.assign(new Error('Invalid login credentials'), {
      name: 'AuthApiError',
      status: 400,
      code: 'invalid_credentials',
    });
    const out = translateError(err);
    expect(out.messageKey).toBe('errors.auth.invalidCredentials');
    expect(out.hintKey).toBe('errors.auth.invalidCredentialsHint');
  });

  test('translates a Postgrest RLS violation', () => {
    const err = {
      code: '42501',
      message: 'permission denied',
      details: '',
      hint: '',
    };
    const out = translateError(err);
    expect(out.messageKey).toBe('errors.db.rls');
  });

  test('falls back to errors.generic for unknown Errors', () => {
    expect(translateError(new Error('boom')).messageKey).toBe('errors.generic');
  });
});
