/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import SocialGrid from '@/components/Social/SocialGrid'

describe('SocialGrid', () => {
  it('renders project assets and triggers curation action', async () => {
    const onMarkReady = jest.fn().mockResolvedValue(undefined)

    render(
      <SocialGrid
        items={[
          {
            id: 'file-1',
            filename: 'creative-1.png',
            status: 'Draft',
            updatedAt: '2026-04-04T12:00:00.000Z',
            previewUrl: '/preview.png',
          },
        ]}
        onMarkReady={onMarkReady}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Marcar como pronto' }))

    await waitFor(() => {
      expect(onMarkReady).toHaveBeenCalledWith('file-1')
    })
  })
})
