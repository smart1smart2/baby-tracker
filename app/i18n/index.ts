import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import uk from './locales/uk.json';

export const SUPPORTED_LANGUAGES = ['en', 'uk'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const deviceLanguageCode = Localization.getLocales()[0]?.languageCode ?? 'en';
const initialLanguage: SupportedLanguage = (SUPPORTED_LANGUAGES as readonly string[]).includes(
  deviceLanguageCode,
)
  ? (deviceLanguageCode as SupportedLanguage)
  : 'en';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: { translation: en },
    uk: { translation: uk },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
