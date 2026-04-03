import Head from 'next/head'
import { OfflineIndicator } from '@/components/atoms'

/**
 * Home Page
 * Landing page for the application
 * Includes offline status indicator in header
 */
export default function Home() {
  return (
    <>
      <Head>
        <title>Brand Ops - Creative Asset Management</title>
        <meta name="description" content="Creative asset management system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header with offline indicator */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Brand Ops</h2>
          <OfflineIndicator />
        </div>
      </header>

      {/* Main content */}
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900">
            🎨 Brand Ops
          </h1>
          <p className="mt-6 text-xl text-gray-600">
            Creative Asset Management System
          </p>
          <div className="mt-8 space-x-4">
            <button className="btn-primary">Get Started</button>
            <button className="btn-secondary">Learn More</button>
          </div>
          <p className="mt-12 text-sm text-gray-500">
            💡 Tip: Open DevTools → Network tab → Check "Offline" to test offline detection
          </p>
        </div>
      </main>
    </>
  )
}
