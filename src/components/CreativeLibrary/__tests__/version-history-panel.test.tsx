/**
 * @jest-environment jsdom
 */


import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'

import { TranslationProvider } from '@/lib/i18n/TranslationContext'
import type { CreativeFileWithMetadata } from '@/lib/types'
import CreativeLibraryPage from '@/pages/creative-library'
import { createAppStore } from '@/store'

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
    updatedAt: new Date('2026-04-04T10:10:00.000Z'),
    metadata: {
      id: 'meta-1',
      fileId: 'file-1',
      type: 'image',
      status: 'Approved',
      tags: ['launch'],
      notes: 'Ready to ship',
      updatedAt: new Date('2026-04-04T10:10:00.000Z'),
    },
  }
}

describe('version history viewer', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('loads the timeline, supports compare mode, and moves through entries with the keyboard', async () => {
    const persistedFile = createFile()
    const store = createAppStore()

    const versions = [
      {
        id: 'version-2',
        fileId: 'file-1',
        versionNum: 2,
        commitHash: 'bbbbbbb2222222',
        shortCommitHash: 'bbbbbbb',
        message: 'docs: Update launch.png metadata - Type: image, Status: In Review',
        createdAt: '2026-04-04T10:05:00.000Z',
        operationType: 'metadata',
        metadataContext: {
          type: 'image',
          status: 'In Review',
          source: 'commit-message',
        },
        isLatest: true,
      },
      {
        id: 'version-1',
        fileId: 'file-1',
        versionNum: 1,
        commitHash: 'aaaaaaa1111111',
        shortCommitHash: 'aaaaaaa',
        message: 'feat: Upload launch.png (v1)',
        createdAt: '2026-04-04T10:00:00.000Z',
        operationType: 'upload',
        metadataContext: null,
        isLatest: false,
      },
    ]

    const details = {
      'version-2': {
        ...versions[0],
        previewUrl: '/api/files/file-1/versions/version-2?asset=preview',
        previewKind: 'image',
        previewMessage: 'Historical image preview is available for this version.',
        compareSummary: {
          currentType: 'image',
          currentStatus: 'Approved',
          historicalType: 'image',
          historicalStatus: 'In Review',
          typeChanged: false,
          statusChanged: true,
          summary: 'Current metadata has drifted from v2. Review the differences before restoring.',
        },
      },
      'version-1': {
        ...versions[1],
        previewUrl: '/api/files/file-1/versions/version-1?asset=preview',
        previewKind: 'image',
        previewMessage: 'Historical image preview is available for this version.',
        compareSummary: {
          currentType: 'image',
          currentStatus: 'Approved',
          historicalType: null,
          historicalStatus: null,
          typeChanged: false,
          statusChanged: false,
          summary: 'This version keeps file and commit context, but full metadata snapshot details were not stored for this save.',
        },
      },
    }

    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      const method = init?.method ?? 'GET'

      if (url === '/api/files' && method === 'GET') {
        return createJsonResponse([persistedFile])
      }

      if (url === '/api/versioning/status' && method === 'GET') {
        return createJsonResponse({ states: [] })
      }

      if (url === '/api/files/file-1/versions' && method === 'GET') {
        return createJsonResponse({ versions })
      }

      if (url === '/api/files/file-1/versions/version-2' && method === 'GET') {
        return createJsonResponse({ version: details['version-2'] })
      }

      if (url === '/api/files/file-1/versions/version-1' && method === 'GET') {
        return createJsonResponse({ version: details['version-1'] })
      }

      throw new Error(`Unhandled fetch: ${method} ${url}`)
    }) as typeof fetch

    render(
      <Provider store={store}>
        <TranslationProvider>
          <CreativeLibraryPage />
        </TranslationProvider>
      </Provider>,
    )

    await screen.findByText('launch.png')
    fireEvent.click(screen.getByText('launch.png'))
    await screen.findByText('Editor de Metadados')

    fireEvent.click(screen.getByRole('button', { name: 'Historico' }))

    await screen.findByText('Historico de Versoes')
    await waitFor(() => {
      expect(
        screen.getAllByText('docs: Update launch.png metadata - Type: image, Status: In Review').length,
      ).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getByRole('button', { name: 'Comparar' }))

    expect(
      screen.getByText('Current metadata has drifted from v2. Review the differences before restoring.'),
    ).not.toBeNull()

    const firstEntry = screen.getByRole('button', { pressed: true })
    firstEntry.focus()
    fireEvent.keyDown(firstEntry, { key: 'ArrowDown' })

    await waitFor(() => {
      expect(screen.getByText('This version keeps file and commit context, but full metadata snapshot details were not stored for this save.')).not.toBeNull()
    })
  })
})
