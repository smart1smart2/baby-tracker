import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export type OAuthOutcome =
  | { ok: true }
  | { ok: false; cancelled: true }
  | { ok: false; cancelled: false; error: unknown };

/**
 * Supabase returns either a PKCE `?code` or an implicit-flow `#access_token`
 * fragment depending on the project, so we handle both before falling back
 * to a generic error. The auth state-change listener picks the session up.
 */
export async function signInWithGoogle(): Promise<OAuthOutcome> {
  const redirectTo = Linking.createURL('auth/callback');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) return { ok: false, cancelled: false, error };
  if (!data?.url) {
    return { ok: false, cancelled: false, error: new Error('Missing OAuth URL') };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return { ok: false, cancelled: true };

  const { queryParams } = Linking.parse(result.url);
  const code = typeof queryParams?.code === 'string' ? queryParams.code : null;
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) return { ok: false, cancelled: false, error: exchangeError };
    return { ok: true };
  }

  const fragment = result.url.split('#')[1];
  if (fragment) {
    const params = new URLSearchParams(fragment);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (access_token && refresh_token) {
      const { error: setError } = await supabase.auth.setSession({ access_token, refresh_token });
      if (setError) return { ok: false, cancelled: false, error: setError };
      return { ok: true };
    }
  }

  return { ok: false, cancelled: false, error: new Error('OAuth callback missing tokens') };
}
