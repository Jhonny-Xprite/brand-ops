import Head from 'next/head'

/**
 * Home Page
 * Landing page for the application
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
        </div>
      </main>
    </>
  )
}
