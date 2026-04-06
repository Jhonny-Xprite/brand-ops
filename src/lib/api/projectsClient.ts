/**
 * Projects API Client
 * Centralized, typed API functions for project operations
 */

export interface ProjectResponse {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListResponse {
  projects: ProjectResponse[];
  total: number;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

/**
 * Fetch all projects
 */
export async function fetchProjects(): Promise<ProjectListResponse> {
  const response = await fetch('/api/projects');

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectRequest): Promise<ProjectResponse> {
  const response = await fetch('/api/projects/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to create project: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get a single project by ID
 */
export async function fetchProjectById(projectId: string): Promise<ProjectResponse> {
  const response = await fetch(`/api/projects/${projectId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch project: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update project details
 */
export async function updateProject(
  projectId: string,
  data: Partial<CreateProjectRequest>
): Promise<ProjectResponse> {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to update project: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  const response = await fetch(`/api/projects/${projectId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete project: ${response.statusText}`);
  }
}
