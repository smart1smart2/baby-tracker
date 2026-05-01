import * as Sentry from '@sentry/react-native';

import { env } from './env';

/**
 * True when a DSN is configured and we're not in a dev bundle. Gates both
 * `initSentry()` and `Sentry.wrap()` so the two stay in sync — wrapping
 * without init logs a confusing "Sentry.wrap called before Sentry.init".
 */
export const sentryEnabled = !__DEV__ && Boolean(env.sentryDsn);

export function initSentry() {
  if (!sentryEnabled) return;
  Sentry.init({
    dsn: env.sentryDsn!,
    tracesSampleRate: 0.2,
    enableNative: true,
  });
}

export { Sentry };
