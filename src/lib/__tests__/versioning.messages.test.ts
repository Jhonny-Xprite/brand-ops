import { buildVersionCommitMessage } from '@/lib/versioning'

describe('versioning message builder', () => {
  it('builds deterministic upload messages', () => {
    expect(
      buildVersionCommitMessage('upload', { filename: 'launch.png' }, 1),
    ).toBe('feat: Upload launch.png (v1)')
  })

  it('builds deterministic metadata messages', () => {
    expect(
      buildVersionCommitMessage(
        'metadata',
        { filename: 'launch.png', type: 'image', status: 'Approved' },
        2,
      ),
    ).toBe('docs: Update launch.png metadata - Type: image, Status: Approved')
  })

  it('throws when metadata inputs are incomplete', () => {
    expect(() =>
      buildVersionCommitMessage('metadata', { filename: 'launch.png', status: 'Approved' }, 2),
    ).toThrow('GIT-007')
  })
})
