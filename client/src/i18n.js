import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import translationEN from './locales/en/translation.json';
import translationTA from './locales/ta/translation.json';
import translationHI from './locales/hi/translation.json';
import translationBN from './locales/bn/translation.json';
import translationTE from './locales/te/translation.json';
import translationMR from './locales/mr/translation.json';
import translationGU from './locales/gu/translation.json';
import translationKN from './locales/kn/translation.json';

const resources = {
    en: { translation: translationEN },
    ta: { translation: translationTA },
    hi: { translation: translationHI },
    bn: { translation: translationBN },
    te: { translation: translationTE },
    mr: { translation: translationMR },
    gu: { translation: translationGU },
    kn: { translation: translationKN },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

export default i18n;
