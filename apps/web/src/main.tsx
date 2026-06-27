import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloProvider } from '@apollo/client/react'
import { I18nextProvider } from 'react-i18next'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/context/auth.context'
import { AbilityBridge } from '@/context/ability-bridge'
import { AppBootstrap } from '@/components/AppBootstrap'
import { apolloClient } from '@/lib/apollo'
import { i18n } from '@/i18n/index'
import { NuqsAdapter } from 'nuqs/adapters/react-router'
import { Router } from '@/router/Router'
import '@/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>
          <AuthProvider>
            <AppBootstrap>
              <AbilityBridge>
                <NuqsAdapter>
                  <Router />
                  <Toaster position="bottom-right" richColors />
                </NuqsAdapter>
              </AbilityBridge>
            </AppBootstrap>
          </AuthProvider>
        </TooltipProvider>
      </I18nextProvider>
    </ApolloProvider>
  </StrictMode>,
)
