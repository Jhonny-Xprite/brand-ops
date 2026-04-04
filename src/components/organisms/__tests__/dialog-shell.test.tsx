/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react'

import { DialogShell } from '../DialogShell'

describe('DialogShell', () => {
  it('renders a reusable dialog shell with close and action controls', () => {
    const handleClose = jest.fn()

    render(
      <DialogShell
        eyebrow="Rename asset"
        title="Rename launch.png"
        titleId="rename-dialog-title"
        onClose={handleClose}
        actions={<button type="button">Save</button>}
      >
        <label htmlFor="rename-field">New file name</label>
        <input id="rename-field" defaultValue="launch-v2" />
      </DialogShell>,
    )

    expect(screen.getByRole('dialog', { name: 'Rename launch.png' })).toBeTruthy()
    expect(screen.getByText('Rename asset')).toBeTruthy()
    expect(screen.getByLabelText('New file name')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
