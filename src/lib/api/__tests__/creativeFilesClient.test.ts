import {
  fetchFiles,
  uploadFile,
  updateFileMetadata,
  deleteFile,
  type FileResponse,
  type FileListResponse,
} from '../creativeFilesClient';

// Mock fetch globally
global.fetch = jest.fn();

describe('Creative Files Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchFiles', () => {
    it('should fetch files without search params', async () => {
      const mockData: FileListResponse = {
        files: [
          { id: '1', name: 'file1.jpg', size: 1024, type: 'image/jpeg', url: '/file1.jpg', createdAt: '2026-04-06T00:00:00Z' },
        ],
        total: 1,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchFiles();

      expect(global.fetch).toHaveBeenCalledWith('/api/files');
      expect(result).toEqual(mockData);
    });

    it('should fetch files with search params', async () => {
      const mockData: FileListResponse = { files: [], total: 0 };
      const params = new URLSearchParams({ search: 'test' });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchFiles(params);

      expect(global.fetch).toHaveBeenCalledWith('/api/files?search=test');
      expect(result).toEqual(mockData);
    });

    it('should throw error on fetch failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(fetchFiles()).rejects.toThrow('Failed to fetch files: Not Found');
    });
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const mockData: FileResponse = {
        id: '1',
        name: 'test.jpg',
        size: 7,
        type: 'image/jpeg',
        url: '/test.jpg',
        createdAt: '2026-04-06T00:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await uploadFile(file);

      expect(global.fetch).toHaveBeenCalledWith('/api/files/upload', expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      }));
      expect(result).toEqual(mockData);
    });

    it('should upload file with metadata', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const metadata = { description: 'Test image' };
      const mockData: FileResponse = {
        id: '1',
        name: 'test.jpg',
        size: 7,
        type: 'image/jpeg',
        url: '/test.jpg',
        createdAt: '2026-04-06T00:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await uploadFile(file, metadata);

      expect(global.fetch).toHaveBeenCalledWith('/api/files/upload', expect.objectContaining({
        method: 'POST',
      }));
      expect(result).toEqual(mockData);
    });

    it('should throw error on upload failure', async () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(uploadFile(file)).rejects.toThrow('Failed to upload file: Bad Request');
    });
  });

  describe('updateFileMetadata', () => {
    it('should update file metadata successfully', async () => {
      const mockData: FileResponse = {
        id: '1',
        name: 'updated.jpg',
        size: 7,
        type: 'image/jpeg',
        url: '/test.jpg',
        createdAt: '2026-04-06T00:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await updateFileMetadata('1', { name: 'updated.jpg' });

      expect(global.fetch).toHaveBeenCalledWith('/api/files/1', expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'updated.jpg' }),
      }));
      expect(result).toEqual(mockData);
    });

    it('should throw error on update failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Conflict',
      });

      await expect(updateFileMetadata('1', { name: 'test' })).rejects.toThrow(
        'Failed to update file metadata: Conflict'
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await deleteFile('1');

      expect(global.fetch).toHaveBeenCalledWith('/api/files/1', {
        method: 'DELETE',
      });
    });

    it('should throw error on delete failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden',
      });

      await expect(deleteFile('1')).rejects.toThrow('Failed to delete file: Forbidden');
    });
  });
});
