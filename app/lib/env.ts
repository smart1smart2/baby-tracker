const required = (name: string, value: string | undefined) => {
  if (!value) {
    throw new Error(
      `Missing env var ${name}. Copy .env.example → .env and set it before starting the app.`,
    );
  }
  return value;
};

export const env = {
  supabaseUrl: required('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: required('EXPO_PUBLIC_SUPABASE_ANON_KEY', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),
  /** Optional. When unset, Sentry stays disabled and no events are sent. */
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? null,
};
