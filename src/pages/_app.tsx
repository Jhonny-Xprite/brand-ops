import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import store from '@/store'
import '@/styles/globals.css'

/**
 * Next.js App Component
 * Wraps all pages with Redux Provider for state management
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  )
}
