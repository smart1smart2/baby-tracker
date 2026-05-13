import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import uk from './locales/uk.json';

export const SUPPORTED_LANGUAGES = ['en', 'uk'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = 'app-language';

const isSupported = (lang: string | null | undefined): lang is SupportedLanguage =>
  Boolean(lang) && (SUPPORTED_LANGUAGES as readonly string[]).includes(lang as string);

const deviceLanguageCode = Localization.getLocales()[0]?.languageCode ?? 'en';
const fallbackLanguage: SupportedLanguage = isSupported(deviceLanguageCode)
  ? deviceLanguageCode
  : 'en';

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: { translation: en },
    uk: { translation: uk },
  },
  lng: fallbackLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

// Restore previously chosen language from storage; falls back to device locale.
AsyncStorage.getItem(STORAGE_KEY)
  .then((stored) => {
    // eslint-disable-next-line import/no-named-as-default-member
    if (isSupported(stored)) void i18n.changeLanguage(stored);
  })
  .catch(() => {
    /* ignore — startup falls back to device locale */
  });

/** Change the active language and persist the choice. */
export async function setLanguage(lang: SupportedLanguage): Promise<void> {
  // eslint-disable-next-line import/no-named-as-default-member
  await i18n.changeLanguage(lang);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* ignore — language is still applied for this session */
  }
}

export default i18n;
