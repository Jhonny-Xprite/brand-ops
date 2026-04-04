import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { TranslationProvider } from '@/lib/i18n/TranslationContext'
import store from '@/store'
import '@/styles/globals.css'

/**
 * Next.js App Component
 * Wraps all pages with Redux Provider for state management
 * Registers Service Worker on app initialization
 */
export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Register Service Worker on app mount
    registerServiceWorker()
  }, [])

  return (
    <Provider store={store}>
      <TranslationProvider>
        <Component {...pageProps} />
      </TranslationProvider>
    </Provider>
  )
}
/**
 * Registers the Service Worker
 * Gracefully handles browsers that don't support Service Workers
 */
function registerServiceWorker(): void {
  // Exit early if Service Workers not supported
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[App] Service Workers not supported in this browser')
    return
  }

  // Register the Service Worker
  navigator.serviceWorker
    .register('/sw.js')
    .then((registration) => {
      console.log('[App] Service Worker registered successfully:', {
        scope: registration.scope,
        updateViaCache: registration.updateViaCache,
        active: !!registration.active,
      })
    })
    .catch((error) => {
      console.error('[App] Service Worker registration failed:', error)
    })
}
