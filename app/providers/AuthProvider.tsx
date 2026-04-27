import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthState = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ session: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      const stored = data.session;

      if (stored && (stored.expires_at ?? 0) * 1000 < Date.now() + 60_000) {
        // Token already expired or about to — try refreshing once. If the
        // refresh token is also gone, force sign out so AuthGate redirects
        // to the login screen instead of letting requests fail with RLS
        // denials.
        const { data: refreshed, error } = await supabase.auth.refreshSession();
        if (cancelled) return;
        if (error) {
          await supabase.auth.signOut();
          setSession(null);
        } else {
          setSession(refreshed.session);
        }
      } else {
        setSession(stored);
      }

      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
