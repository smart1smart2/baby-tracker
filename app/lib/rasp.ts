import { Sentry } from './sentry';

// Dynamic require so the module is not loaded at startup in Expo Go,
// where the native module doesn't exist and would crash immediately.
const freeRasp = (() => {
  try {
    return require('freerasp-react-native') as typeof import('freerasp-react-native');
  } catch {
    return null;
  }
})();

const IS_PROD = !__DEV__;

// Export two stable hook implementations chosen once at module load time.
// This satisfies React Rules of Hooks — call order never changes.
function useRaspReal() {
  freeRasp!.useFreeRasp(
    {
      androidConfig: {
        packageName: 'com.anonymous.babytracker',
        // SHA-256 of the signing cert, Base64-encoded.
        // Replace with the EAS cert hash before production build.
        certificateHashes: ['AKoRuyLMM41xAHu3EUhpWv4pjQdLAy9iZzMDHVWbMSo='],
        supportedAlternativeStores: [],
      },
      iosConfig: {
        appBundleId: 'com.anonymous.baby-tracker',
        appTeamId: 'REPLACE_WITH_TEAM_ID',
      },
      watcherMail: 'badb509308@gmail.com',
      isProd: IS_PROD,
    },
    {
      privilegedAccess: () => {
        Sentry.captureMessage('freeRASP: privileged access (root/jailbreak)', 'warning');
      },
      appIntegrity: () => {
        Sentry.captureMessage('freeRASP: app integrity violation', 'warning');
      },
      hooks: () => {
        Sentry.captureMessage('freeRASP: hook framework detected', 'warning');
      },
      unofficialStore: () => {
        Sentry.captureMessage('freeRASP: unofficial store install', 'warning');
      },
      malware: (apps) => {
        Sentry.captureMessage(
          `freeRASP: suspicious apps — ${apps.map((a) => a.packageInfo.packageName).join(', ')}`,
          'warning',
        );
      },
    },
    {
      allChecksFinished: () => {},
    },
  );
}

function useRaspNoop() {
  // freeRASP native module not available (Expo Go / web)
}

export const useRasp = freeRasp ? useRaspReal : useRaspNoop;
