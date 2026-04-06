/** @jest-environment jsdom */

import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import { ThemeProvider } from '@/lib/theme/ThemeContext'
import { ThemeToggle } from '@/components/atoms'

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = 'dark'
    window.localStorage.clear()
  })

  it('toggles the document theme and persists the choice', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: /modo claro/i }))

    expect(document.documentElement.dataset.theme).toBe('light')
    expect(window.localStorage.getItem('brand-ops:theme-mode')).toBe('light')
  })
})
