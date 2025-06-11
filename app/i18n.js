// i18n.js
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import translationEN from '../locales/en/common.json';
import translationFR from '../locales/fr/common.json';
import translationHI from '../locales/hi/common.json';
import Backend from 'i18next-http-backend';

// .use(LanguageDetector)
i18n
  .use(initReactI18next)
  .use(Backend)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'hi'],
    resources: {
      fr: { common: translationFR },
      en: { common: translationEN },
      hi: { common: translationHI },
    },
    ns: ['common'],
    defaultNS: 'common',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
