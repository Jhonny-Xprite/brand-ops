import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { TranslationProvider } from '@/lib/i18n/TranslationContext'
import { ThemeProvider } from '@/lib/theme/ThemeContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
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
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <TranslationProvider>
            <Component {...pageProps} />
          </TranslationProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  )
}
/**
 * Registers the Service Worker
 * Gracefully handles browsers that don't support Service Workers
 */
function registerServiceWorker(): void {
  // Exit early if Service Workers not supported
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  // Register the Service Worker
  navigator.serviceWorker
    .register('/sw.js')
    .catch(() => undefined)
}
