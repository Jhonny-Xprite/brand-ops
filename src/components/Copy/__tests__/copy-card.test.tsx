/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import CopyCard from '@/components/Copy/CopyCard'

describe('CopyCard', () => {
  it('copies content to clipboard and shows feedback', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    })

    render(
      <CopyCard
        title="Headline principal"
        content="Transforme seu acervo em um sistema operacional de marca."
        copyType="headline"
        angle="autoridade"
        audience="leads-quentes"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Copiar texto' }))

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'Transforme seu acervo em um sistema operacional de marca.',
      )
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Copiado!' })).toBeTruthy()
    })
  })
})
