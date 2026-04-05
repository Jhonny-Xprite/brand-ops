/** @jest-environment jsdom */

import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { CreateProjectModal } from '@/components/Projects/CreateProjectModal'

const createProjectMock = jest.fn()

jest.mock('@/hooks/useProjects', () => ({
  useProjects: () => ({
    createProject: createProjectMock,
  }),
}))

class MockFileReader {
  result: string | ArrayBuffer | null = null
  onload: FileReader['onload'] = null

  readAsDataURL() {
    this.result = 'data:image/png;base64,preview'
    if (this.onload) {
      const onLoadHandler = this.onload as NonNullable<FileReader['onload']>
      onLoadHandler.call(
        this as unknown as FileReader,
        { target: this } as unknown as ProgressEvent<FileReader>
      )
    }
  }
}

describe('CreateProjectModal', () => {
  const originalFetch = global.fetch
  const originalFileReader = global.FileReader

  beforeAll(() => {
    global.FileReader = MockFileReader as unknown as typeof FileReader
  })

  afterAll(() => {
    global.FileReader = originalFileReader
  })

  beforeEach(() => {
    createProjectMock.mockReset()
    global.fetch = jest.fn() as typeof fetch
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('uses the shared project creation hook instead of calling fetch directly', async () => {
    const onClose = jest.fn()
    const onSuccess = jest.fn()
    const logoFile = new File(['logo'], 'brand.png', { type: 'image/png' })

    createProjectMock.mockResolvedValue({
      id: 'proj-new',
      name: 'Projeto Novo',
      assetCount: 0,
      createdAt: '2026-04-04T10:00:00.000Z',
    })

    const { container } = render(
      <CreateProjectModal
        isOpen
        onClose={onClose}
        onSuccess={onSuccess}
      />
    )

    fireEvent.change(screen.getByPlaceholderText('Ex: Campanha X'), {
      target: { value: 'Projeto Novo' },
    })
    fireEvent.change(screen.getByPlaceholderText('Ex: Educacao, Moda, Saude'), {
      target: { value: 'Educacao' },
    })

    const fileInput = container.querySelector('input[type="file"]')
    if (!fileInput) {
      throw new Error('File input not found')
    }

    fireEvent.change(fileInput, {
      target: { files: [logoFile] },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Criar Projeto' }))

    await waitFor(() => {
      expect(createProjectMock).toHaveBeenCalledWith({
        projectName: 'Projeto Novo',
        niche: 'Educacao',
        businessModel: 'INFOPRODUTO',
        logoFile,
      })
    })

    expect(global.fetch).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledWith('proj-new')
    expect(onClose).toHaveBeenCalled()
  })
})
