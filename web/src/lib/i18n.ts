import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from '@/locales/en/translation.json';
import ptTranslation from '@/locales/pt/translation.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  pt: {
    translation: ptTranslation,
  },
};

// Custom detector for geolocation-based language selection
const geoLocationDetector = {
  name: 'geoLocation',
  lookup() {
    // Check if already stored in localStorage
    const stored = localStorage.getItem('i18nextLng');
    if (stored) return stored;

    // Detect based on timezone (simple heuristic: Brazil uses Portuguese)
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Brazilian timezones
    const brazilianTimezones = [
      'America/Sao_Paulo',
      'America/Rio_Branco',
      'America/Belem',
      'America/Fortaleza',
      'America/Recife',
      'America/Araguaina',
      'America/Maceio',
      'America/Bahia',
      'America/Campo_Grande',
      'America/Cuiaba',
      'America/Santarem',
      'America/Porto_Velho',
      'America/Boa_Vista',
      'America/Manaus',
      'America/Eirunepe',
      'America/Noronha'
    ];

    // Check if user is in Brazil based on timezone
    if (brazilianTimezones.includes(timeZone)) {
      return 'pt';
    }

    // Check browser language as fallback
    const browserLang = navigator.language || (navigator as any).userLanguage;
    if (browserLang?.startsWith('pt')) {
      return 'pt';
    }

    // Default to English for rest of the world
    return 'en';
  },
  cacheUserLanguage(lng: string) {
    localStorage.setItem('i18nextLng', lng);
  }
};

// Create a custom language detector that includes our geo detector
const languageDetector = new LanguageDetector();
languageDetector.addDetector(geoLocationDetector);

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'geoLocation', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  });

export default i18n;