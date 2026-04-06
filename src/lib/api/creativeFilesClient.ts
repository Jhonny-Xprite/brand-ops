/**
 * Creative Files API Client
 * Centralized, typed API functions for file operations
 */

export interface FileResponse {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  createdAt: string;
}

export interface FileListResponse {
  files: FileResponse[];
  total: number;
}

export interface FileUploadRequest {
  file: File;
  metadata?: Record<string, string>;
}

export interface FileMetadataRequest {
  name?: string;
  tags?: string[];
}

/**
 * Fetch files list with optional search parameters
 */
export async function fetchFiles(searchParams?: URLSearchParams): Promise<FileListResponse> {
  const url = `/api/files${searchParams?.size ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch files: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Upload a new file
 */
export async function uploadFile(file: File, metadata?: Record<string, string>): Promise<FileResponse> {
  const formData = new FormData();
  formData.append('file', file);

  if (metadata) {
    Object.entries(metadata).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  const response = await fetch('/api/files/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update file metadata
 */
export async function updateFileMetadata(
  fileId: string,
  metadata: FileMetadataRequest
): Promise<FileResponse> {
  const response = await fetch(`/api/files/${fileId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    throw new Error(`Failed to update file metadata: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a file
 */
export async function deleteFile(fileId: string): Promise<void> {
  const response = await fetch(`/api/files/${fileId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete file: ${response.statusText}`);
  }
}
