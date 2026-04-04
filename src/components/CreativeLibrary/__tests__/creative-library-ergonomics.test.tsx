/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'

import type { CreativeFileWithMetadata } from '@/lib/types'
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

  it('surfaces breadcrumbs and rename flow for the active asset', async () => {
    let persistedFile: CreativeFileWithMetadata = {
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
        const body = JSON.parse(String(init?.body))

        persistedFile = {
          ...persistedFile,
          filename: `${body.filenameBase}.png`,
          path: `E:\\BRAND-OPS-STORAGE\\${body.filenameBase}.png`,
          updatedAt: new Date('2026-04-04T10:05:00.000Z'),
        }

        return createJsonResponse({
          action: 'rename',
          file: persistedFile,
          message: 'File renamed successfully.',
        })
      }

      throw new Error(`Unhandled fetch: ${method} ${url}`)
    }) as typeof fetch

    render(
      <Provider store={createAppStore()}>
        <CreativeLibraryPage />
      </Provider>,
    )

    await screen.findByText('launch.png')
    expect(screen.getByRole('navigation', { name: 'Library breadcrumbs' }).textContent).toContain('All assets')

    fireEvent.click(screen.getByText('launch.png'))
    fireEvent.keyDown(window, { key: 'F2' })

    await screen.findByRole('dialog')

    fireEvent.change(screen.getByLabelText('New file name'), {
      target: { value: 'hero-banner' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save rename' }))

    await waitFor(() => {
      expect(screen.queryAllByText('hero-banner.png').length).toBeGreaterThan(0)
    })

    expect(screen.getByRole('navigation', { name: 'Library breadcrumbs' }).textContent).toContain('hero-banner.png')
  })
})
