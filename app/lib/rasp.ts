import { useFreeRasp, type TalsecConfig } from 'freerasp-react-native';

import { Sentry } from './sentry';

// isProd=false disables simulator/emulator and debugger blocks so the dev
// build stays usable. Flip to true (or derive from __DEV__) before release.
const IS_PROD = !__DEV__;

const config: TalsecConfig = {
  androidConfig: {
    packageName: 'com.anonymous.babytracker',
    // SHA-256 of the signing certificate, Base64-encoded.
    // Replace with the EAS-managed cert hash before the production build:
    //   npx eas credentials → Android → get SHA-256 → base64-encode it
    certificateHashes: ['AKoRuyLMM41xAHu3EUhpWv4pjQdLAy9iZzMDHVWbMSo='],
    supportedAlternativeStores: [],
  },
  iosConfig: {
    appBundleId: 'com.anonymous.baby-tracker',
    // Find in Xcode or developer.apple.com → Membership → Team ID
    appTeamId: 'REPLACE_WITH_TEAM_ID',
  },
  watcherMail: 'badb509308@gmail.com',
  isProd: IS_PROD,
};

export function useRasp() {
  useFreeRasp(
    config,
    {
      // Root / jailbreak — highest-risk signal; log and alert parent.
      privilegedAccess: () => {
        Sentry.captureMessage('freeRASP: privileged access (root/jailbreak)', 'warning');
      },
      // App binary was modified — could be repackaged with malware.
      appIntegrity: () => {
        Sentry.captureMessage('freeRASP: app integrity violation', 'warning');
      },
      // Dynamic hooking framework detected (Frida, Shadow, …).
      hooks: () => {
        Sentry.captureMessage('freeRASP: hook framework detected', 'warning');
      },
      // Installed from outside Play Store / App Store.
      unofficialStore: () => {
        Sentry.captureMessage('freeRASP: unofficial store install', 'warning');
      },
      // Suspicious apps on the same device (Android).
      malware: (apps) => {
        Sentry.captureMessage(
          `freeRASP: suspicious apps — ${apps.map((a) => a.packageInfo.packageName).join(', ')}`,
          'warning',
        );
      },
    },
    {
      allChecksFinished: () => {
        // All startup checks done — no action needed.
      },
    },
  );
}
