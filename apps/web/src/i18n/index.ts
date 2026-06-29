import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import esEnums from './es/enums.json'
import enEnums from './en/enums.json'
import esCommon from './es/common.json'
import enCommon from './en/common.json'
import esWorkspace from './es/workspace.json'
import enWorkspace from './en/workspace.json'
import esReleases from './es/releases.json'
import enReleases from './en/releases.json'
import esFeatures from './es/features.json'
import enFeatures from './en/features.json'
import esFlags from './es/flags.json'
import enFlags from './en/flags.json'
import esTickets from './es/tickets.json'
import enTickets from './en/tickets.json'
import esAi from './es/ai.json'
import enAi from './en/ai.json'
import esSettings from './es/settings.json'
import enSettings from './en/settings.json'
import esCollaboration from './es/collaboration.json'
import enCollaboration from './en/collaboration.json'
import esOnboarding from './es/onboarding.json'
import enOnboarding from './en/onboarding.json'
import esEditor from './es/editor.json'
import enEditor from './en/editor.json'

i18n.use(initReactI18next).init({
  lng: localStorage.getItem('language') ?? 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  resources: {
    es: {
      enums: esEnums,
      common: esCommon,
      workspace: esWorkspace,
      releases: esReleases,
      features: esFeatures,
      flags: esFlags,
      tickets: esTickets,
      ai: esAi,
      settings: esSettings,
      collaboration: esCollaboration,
      onboarding: esOnboarding,
      editor: esEditor,
    },
    en: {
      enums: enEnums,
      common: enCommon,
      workspace: enWorkspace,
      releases: enReleases,
      features: enFeatures,
      flags: enFlags,
      tickets: enTickets,
      ai: enAi,
      settings: enSettings,
      collaboration: enCollaboration,
      onboarding: enOnboarding,
      editor: enEditor,
    },
  },
  interpolation: {
    escapeValue: false,
  },
})

export { i18n }
