/** @jest-environment jsdom */

import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import BrandingForm from '@/components/Config/BrandingForm'

describe('BrandingForm', () => {
  it('submits updated branding values through the shared semantic form', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined)

    render(
      <BrandingForm
        initialData={{
          projectName: 'Projeto Demo',
          primaryColor: '#7c3aed',
          secondaryColor: '#fcd34d',
          accentColor: '#f97316',
          neutralBase: '#1A1427',
          titleFont: 'Sora',
          bodyFont: 'Inter',
          clientBrandMode: 'FULL_SHELL',
          surfaceStyle: 'AURORA',
          visualDensity: 'BALANCED',
          brandTone: 'LUXURY_STRATEGIC',
        }}
        onSubmit={onSubmit}
      />
    )

    fireEvent.change(screen.getByDisplayValue('#7c3aed'), {
      target: { value: '#1d4ed8' },
    })

    fireEvent.change(screen.getByDisplayValue('Projeto Demo'), {
      target: { value: 'Projeto Atualizado' },
    })

    const bodyFontLabel = screen.getByText('Fonte de Corpo')
    const bodyFontSelect = bodyFontLabel.parentElement?.querySelector('select')
    expect(bodyFontSelect).not.toBeNull()
    fireEvent.change(bodyFontSelect as HTMLSelectElement, {
      target: { value: 'DM Sans' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Brand Core' }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })

    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      projectName: 'Projeto Atualizado',
      primaryColor: '#1d4ed8',
      secondaryColor: '#fcd34d',
      accentColor: '#f97316',
      neutralBase: '#1A1427',
      titleFont: 'Sora',
      bodyFont: 'DM Sans',
    })
  })
})
