import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import esCommon from './es/common.json'
import enCommon from './en/common.json'

i18n.use(initReactI18next).init({
  lng: localStorage.getItem('language') ?? 'es',
  fallbackLng: 'en',
  defaultNS: 'common',
  resources: {
    es: { common: esCommon },
    en: { common: enCommon },
  },
  interpolation: {
    escapeValue: false,
  },
})

export { i18n }
