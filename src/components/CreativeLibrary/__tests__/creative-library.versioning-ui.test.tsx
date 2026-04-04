/**
 * @jest-environment jsdom
 */

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'

import type { CreativeFileWithMetadata } from '@/lib/types'
import type { VersioningLifecycleState } from '@/lib/versioning'
import CreativeLibraryPage from '@/pages/creative-library'
import { createAppStore } from '@/store'
import { upsertVersioningState } from '@/store/creativeLibrary/versioning.slice'

function createJsonResponse(data: unknown, ok = true) {
  return {
    ok,
    json: async () => data,
  } as Response
}

function createFile(): CreativeFileWithMetadata {
  return {
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
}

function createVersioningState(overrides: Partial<VersioningLifecycleState>): VersioningLifecycleState {
  return {
    fileId: 'file-1',
    jobId: 'job-1',
    state: 'queued',
    operationType: 'metadata',
    attempt: 0,
    updatedAt: new Date().toISOString(),
    batchEligible: true,
    ...overrides,
  }
}

describe('creative library versioning UX', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('shows the difference between local save success and final version-history success', async () => {
    const persistedFile = createFile()
    const store = createAppStore()

    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method ?? 'GET'

      if (url === '/api/files' && method === 'GET') {
        return createJsonResponse([persistedFile])
      }

      if (url === '/api/versioning/status' && method === 'GET') {
        return createJsonResponse({ states: [] })
      }

      throw new Error(`Unhandled fetch: ${method} ${url}`)
    }) as typeof fetch

    render(
      <Provider store={store}>
        <CreativeLibraryPage />
      </Provider>,
    )

    await screen.findByText('launch.png')

    await act(async () => {
      store.dispatch(
        upsertVersioningState(
          createVersioningState({
            state: 'queued',
          }),
        ),
      )
    })

    expect(screen.getByText('Local save complete')).not.toBeNull()
    expect(screen.getByText(/Version save queued/i)).not.toBeNull()

    await act(async () => {
      store.dispatch(
        upsertVersioningState(
          createVersioningState({
            state: 'complete',
            message: 'Version history updated.',
          }),
        ),
      )
    })

    expect(screen.getByText('Version history updated')).not.toBeNull()
    expect(screen.getAllByText(/Version saved/i).length).toBeGreaterThan(0)
  })

  it('blocks additional edits when refresh-required state is emitted', async () => {
    const persistedFile = createFile()
    const store = createAppStore()

    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method ?? 'GET'

      if (url === '/api/files' && method === 'GET') {
        return createJsonResponse([persistedFile])
      }

      if (url === '/api/versioning/status' && method === 'GET') {
        return createJsonResponse({ states: [] })
      }

      throw new Error(`Unhandled fetch: ${method} ${url}`)
    }) as typeof fetch

    render(
      <Provider store={store}>
        <CreativeLibraryPage />
      </Provider>,
    )

    await screen.findByText('launch.png')
    fireEvent.click(screen.getByText('launch.png'))
    await screen.findByText('Metadata Editor')

    fireEvent.change(screen.getByLabelText('Metadata notes'), {
      target: { value: 'Updated notes' },
    })

    await act(async () => {
      store.dispatch(
        upsertVersioningState(
          createVersioningState({
            state: 'failed',
            errorCode: 'CON-004',
            message: 'This file changed before your save finished. Refresh to review the latest version.',
          }),
        ),
      )
    })

    expect(screen.getAllByText('Refresh required').length).toBeGreaterThan(0)
    expect(screen.getByText(/Refresh is required before more edits can be saved safely/i)).not.toBeNull()
    await waitFor(() => {
      expect((screen.getByRole('button', { name: 'Save Metadata' }) as HTMLButtonElement).disabled).toBe(true)
    })
  })
})
