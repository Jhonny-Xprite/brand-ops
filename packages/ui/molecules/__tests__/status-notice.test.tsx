/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react'

import { StatusNotice } from '../StatusNotice'

describe('StatusNotice', () => {
  it('renders the semantic notice content and supports optional actions', () => {
    const handleDismiss = jest.fn()

    render(
      <StatusNotice
        title="Action needs attention"
        message="A semantic notice keeps behavior consistent."
        tone="error"
        role="alert"
        aside={
          <button type="button" onClick={handleDismiss}>
            Dismiss
          </button>
        }
      />,
    )

    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByText('Action needs attention')).toBeTruthy()
    expect(screen.getByText('A semantic notice keeps behavior consistent.')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))

    expect(handleDismiss).toHaveBeenCalledTimes(1)
  })
})
