import { NextApiRequest, NextApiResponse } from 'next'
import handler from '../versioning/status'
import { versioningService } from '@/lib/versioning'

jest.mock('@/lib/versioning', () => ({
  versioningService: {
    getLifecycleState: jest.fn(),
  },
}))

describe('GET /api/versioning/status', () => {
  let req: Partial<NextApiRequest>
  let res: Partial<NextApiResponse>
  let statusMock: jest.Mock
  let jsonMock: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    statusMock = jest.fn().mockReturnThis()
    jsonMock = jest.fn().mockReturnThis()

    req = {
      method: 'GET',
      query: {},
    }

    res = {
      status: statusMock,
      json: jsonMock,
    }
  })

  it('should return 200 with all states when no fileId provided', () => {
    const mockStates = {
      'file-1': { version: 1, status: 'committed' },
      'file-2': { version: 2, status: 'pending' },
    }

    ;(versioningService.getLifecycleState as jest.Mock).mockReturnValue(mockStates)

    handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect(jsonMock).toHaveBeenCalledWith({
      states: mockStates,
    })
  })

  it('should return 200 with specific file state when fileId provided', () => {
    req.query = { fileId: 'file-123' }

    const mockState = { version: 1, status: 'committed', lastModified: '2024-01-01' }

    ;(versioningService.getLifecycleState as jest.Mock).mockReturnValue(mockState)

    handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect(jsonMock).toHaveBeenCalledWith({
      state: mockState,
    })
    expect(versioningService.getLifecycleState).toHaveBeenCalledWith('file-123')
  })

  it('should call getLifecycleState with fileId string', () => {
    req.query = { fileId: 'file-456' }

    ;(versioningService.getLifecycleState as jest.Mock).mockReturnValue({})

    handler(req as NextApiRequest, res as NextApiResponse)

    expect(versioningService.getLifecycleState).toHaveBeenCalledWith('file-456')
  })

  it('should return all states when fileId is array', () => {
    req.query = { fileId: ['file-1', 'file-2'] }

    const mockStates = {
      'file-1': { version: 1 },
      'file-2': { version: 2 },
    }

    ;(versioningService.getLifecycleState as jest.Mock).mockReturnValue(mockStates)

    handler(req as NextApiRequest, res as NextApiResponse)

    // When fileId is not a string, should return all states
    expect(statusMock).toHaveBeenCalledWith(200)
    expect(jsonMock).toHaveBeenCalledWith({
      states: mockStates,
    })
  })

  it('should return 405 for POST requests', () => {
    req.method = 'POST'

    handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(405)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('should return 405 for DELETE requests', () => {
    req.method = 'DELETE'

    handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(405)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('should return 405 for PATCH requests', () => {
    req.method = 'PATCH'

    handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(405)
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('should handle empty lifecycle state', () => {
    req.query = { fileId: 'file-none' }

    ;(versioningService.getLifecycleState as jest.Mock).mockReturnValue(null)

    handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect(jsonMock).toHaveBeenCalledWith({
      state: null,
    })
  })

  it('should handle empty states object', () => {
    ;(versioningService.getLifecycleState as jest.Mock).mockReturnValue({})

    handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect(jsonMock).toHaveBeenCalledWith({
      states: {},
    })
  })

  it('should be callable without query parameters', () => {
    req.query = {}

    const mockStates = {}
    ;(versioningService.getLifecycleState as jest.Mock).mockReturnValue(mockStates)

    handler(req as NextApiRequest, res as NextApiResponse)

    expect(statusMock).toHaveBeenCalledWith(200)
    expect(versioningService.getLifecycleState).toHaveBeenCalledWith()
  })

  it('should preserve fileId type when passed', () => {
    req.query = { fileId: 'test-file-id-123' }

    ;(versioningService.getLifecycleState as jest.Mock).mockReturnValue({})

    handler(req as NextApiRequest, res as NextApiResponse)

    expect(versioningService.getLifecycleState).toHaveBeenCalledWith('test-file-id-123')
  })
})
