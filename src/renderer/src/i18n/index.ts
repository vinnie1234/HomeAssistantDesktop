import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import nl from './locales/nl'
import de from './locales/de'
import fr from './locales/fr'
import es from './locales/es'

export const SUPPORTED_LANGUAGES = {
  en: 'English',
  nl: 'Nederlands',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español'
} as const

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES

function detectLanguage(): LanguageCode {
  const nav = navigator.language.split('-')[0]
  return (nav in SUPPORTED_LANGUAGES ? nav : 'en') as LanguageCode
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    nl: { translation: nl },
    de: { translation: de },
    fr: { translation: fr },
    es: { translation: es }
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

export default i18n
