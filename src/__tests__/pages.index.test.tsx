/** @jest-environment jsdom */

import '@testing-library/jest-dom'
import type { ImgHTMLAttributes, ReactNode } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import Home from '@/pages/index'
import { createAppStore } from '@/store'
import { setActiveProjectId } from '@/store/projects/projects.slice'

const pushMock = jest.fn()

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => children,
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt || ''} />,
}))

function createJsonResponse(data: unknown) {
  return {
    ok: true,
    json: async () => data,
  } as Response
}

describe('Home Page - Project Selection', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    pushMock.mockReset()
    window.localStorage.clear()
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.restoreAllMocks()
  })

  it('navigates with router.push and persists the active project in Redux', async () => {
    global.fetch = jest.fn(async () =>
      createJsonResponse([
        {
          id: 'proj-1',
          name: 'Projeto Alpha',
          assetCount: 5,
          createdAt: '2026-04-04T10:00:00.000Z',
        },
      ])
    ) as typeof fetch

    const store = createAppStore()

    render(
      <Provider store={store}>
        <Home />
      </Provider>
    )

    expect(await screen.findByText('Projeto Alpha')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Projeto Alpha'))

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/projeto/proj-1')
    })

    expect(store.getState().projects.activeProjectId).toBe('proj-1')
  })

  it('clears stale active project context when the home hub mounts', async () => {
    global.fetch = jest.fn(async () => createJsonResponse([])) as typeof fetch

    const store = createAppStore()
    store.dispatch(setActiveProjectId('proj-stale'))

    render(
      <Provider store={store}>
        <Home />
      </Provider>
    )

    await waitFor(() => {
      expect(store.getState().projects.activeProjectId).toBeNull()
    })
  })
})
