import {
  fetchProjects,
  createProject,
  fetchProjectById,
  updateProject,
  deleteProject,
  type ProjectResponse,
  type ProjectListResponse,
} from '../projectsClient';

// Mock fetch globally
global.fetch = jest.fn();

describe('Projects Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchProjects', () => {
    it('should fetch all projects', async () => {
      const mockData: ProjectListResponse = {
        projects: [
          { id: '1', name: 'Project A', createdAt: '2026-04-06T00:00:00Z', updatedAt: '2026-04-06T00:00:00Z' },
        ],
        total: 1,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchProjects();

      expect(global.fetch).toHaveBeenCalledWith('/api/projects');
      expect(result).toEqual(mockData);
    });

    it('should throw error on fetch failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(fetchProjects()).rejects.toThrow('Failed to fetch projects: Internal Server Error');
    });
  });

  describe('createProject', () => {
    it('should create project successfully', async () => {
      const mockData: ProjectResponse = {
        id: '1',
        name: 'New Project',
        description: 'Test project',
        createdAt: '2026-04-06T00:00:00Z',
        updatedAt: '2026-04-06T00:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await createProject({ name: 'New Project', description: 'Test project' });

      expect(global.fetch).toHaveBeenCalledWith('/api/projects/create', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Project', description: 'Test project' }),
      }));
      expect(result).toEqual(mockData);
    });

    it('should throw error on create failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      await expect(createProject({ name: 'Test' })).rejects.toThrow('Failed to create project: Bad Request');
    });
  });

  describe('fetchProjectById', () => {
    it('should fetch project by ID', async () => {
      const mockData: ProjectResponse = {
        id: '1',
        name: 'Project A',
        createdAt: '2026-04-06T00:00:00Z',
        updatedAt: '2026-04-06T00:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchProjectById('1');

      expect(global.fetch).toHaveBeenCalledWith('/api/projects/1');
      expect(result).toEqual(mockData);
    });

    it('should throw error on fetch failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      await expect(fetchProjectById('999')).rejects.toThrow('Failed to fetch project: Not Found');
    });
  });

  describe('updateProject', () => {
    it('should update project successfully', async () => {
      const mockData: ProjectResponse = {
        id: '1',
        name: 'Updated Project',
        createdAt: '2026-04-06T00:00:00Z',
        updatedAt: '2026-04-06T00:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await updateProject('1', { name: 'Updated Project' });

      expect(global.fetch).toHaveBeenCalledWith('/api/projects/1', expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Project' }),
      }));
      expect(result).toEqual(mockData);
    });

    it('should throw error on update failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Conflict',
      });

      await expect(updateProject('1', { name: 'Test' })).rejects.toThrow(
        'Failed to update project: Conflict'
      );
    });
  });

  describe('deleteProject', () => {
    it('should delete project successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await deleteProject('1');

      expect(global.fetch).toHaveBeenCalledWith('/api/projects/1', {
        method: 'DELETE',
      });
    });

    it('should throw error on delete failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden',
      });

      await expect(deleteProject('1')).rejects.toThrow('Failed to delete project: Forbidden');
    });
  });
});
