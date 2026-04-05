/** @jest-environment jsdom */

import '@testing-library/jest-dom'
import type { ReactNode } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createAppStore } from '@/store'
import { setActiveProjectId } from '@/store/projects/projects.slice'
import { TranslationProvider } from '@/lib/i18n/TranslationContext'
import GlobalTopBar from '@/components/Layout/GlobalTopBar'

const pushMock = jest.fn()

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, className }: { children: ReactNode; href: string; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

describe('GlobalTopBar project switching', () => {
  beforeEach(() => {
    pushMock.mockReset()
  })

  it('clears project context and routes back to home when switching projects', async () => {
    const store = createAppStore()
    store.dispatch(setActiveProjectId('proj-123'))

    render(
      <Provider store={store}>
        <TranslationProvider>
          <GlobalTopBar projectName="Projeto Ativo" />
        </TranslationProvider>
      </Provider>
    )

    fireEvent.click(screen.getByRole('button', { name: /Trocar Projeto/i }))

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/')
    })

    expect(store.getState().projects.activeProjectId).toBeNull()
  })
})
