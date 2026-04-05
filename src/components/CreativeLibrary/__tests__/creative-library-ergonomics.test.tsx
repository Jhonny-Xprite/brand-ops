/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'

import type { CreativeFileWithMetadata } from '@/lib/types'
import { TranslationProvider } from '@/lib/i18n/TranslationContext'
import CreativeLibraryPage from '@/pages/creative-library'
import { createAppStore } from '@/store'

function createJsonResponse(data: unknown, ok = true) {
  return {
    ok,
    json: async () => data,
  } as Response
}

describe('creative library ergonomics', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('surfaces navigation and metadata context for the active asset', async () => {
    const persistedFile: CreativeFileWithMetadata = {
      id: 'file-1',
      path: 'E:\\BRAND-OPS-STORAGE\\launch.png',
      filename: 'launch.png',
      type: 'image',
      size: BigInt(2048),
      mimeType: 'image/png',
      createdAt: new Date('2026-04-04T10:00:00.000Z'),
      updatedAt: new Date('2026-04-04T10:00:00.000Z'),
      metadata: {
        id: 'meta-1',
        fileId: 'file-1',
        type: 'image',
        status: 'Draft',
        tags: ['launch'],
        notes: 'Initial notes',
        updatedAt: new Date('2026-04-04T10:00:00.000Z'),
      },
    }

    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method ?? 'GET'

      if (url === '/api/files' && method === 'GET') {
        return createJsonResponse([persistedFile])
      }

      if (url === '/api/files/file-1/actions' && method === 'POST') {
        return createJsonResponse({ error: 'Rename flow is not active in this surface.' }, false)
      }

      throw new Error(`Unhandled fetch: ${method} ${url}`)
    }) as typeof fetch

    render(
      <Provider store={createAppStore()}>
        <TranslationProvider>
          <CreativeLibraryPage />
        </TranslationProvider>
      </Provider>,
    )

    await screen.findByText('launch.png')
    expect(screen.getByRole('navigation', { name: 'Creative navigation shell' })).toBeTruthy()
    expect(screen.getByRole('searchbox', { name: 'Busca' })).toBeTruthy()

    fireEvent.click(screen.getByText('launch.png'))

    await waitFor(() => {
      expect(screen.getByText('Editor de Metadados')).toBeTruthy()
    })

    expect(screen.getAllByText('launch.png').length).toBeGreaterThan(0)
  })
})
