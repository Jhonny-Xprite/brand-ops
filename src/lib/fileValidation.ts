/**
 * File Upload Validation Utility
 * Validates files by size and MIME type using whitelist approach
 */

export interface ValidationConfig {
  maxSizeMB: number;
  allowedTypes: string[];
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  code?: string;
}

/**
 * MIME type to extension mapping for validation
 * Helps prevent spoofed file extensions
 */
const MIME_TYPE_MAP: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/gif': ['gif'],
  'video/mp4': ['mp4'],
  'video/quicktime': ['mov'],
  'video/webm': ['webm'],
  'application/photoshop': ['psd'],
  'image/vnd.adobe.photoshop': ['psd'],
  'application/postscript': ['ai'],
  'application/illustrator': ['ai'],
};

/**
 * Get allowed MIME types from extension whitelist
 */
function getAllowedMimeTypes(allowedExtensions: string[]): Set<string> {
  const allowedMimes = new Set<string>();

  for (const [mime, extensions] of Object.entries(MIME_TYPE_MAP)) {
    if (extensions.some((ext) => allowedExtensions.includes(ext))) {
      allowedMimes.add(mime);
    }
  }

  return allowedMimes;
}

/**
 * Validate file upload by size
 * Returns 413 Payload Too Large if file exceeds maxSizeMB
 */
export function validateFileSize(
  fileSizeBytes: number,
  maxSizeMB: number
): ValidationResult {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (fileSizeBytes > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
      code: '413', // Payload Too Large
    };
  }

  return { isValid: true };
}

/**
 * Validate file type by MIME type and extension
 * Returns 400 Bad Request if file type not in whitelist
 */
export function validateFileType(
  filename: string,
  mimeType: string,
  allowedExtensions: string[]
): ValidationResult {
  // Extract file extension
  const fileExtension = filename.split('.').pop()?.toLowerCase() || '';

  // Check if extension is in whitelist
  if (!allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: 'File type not allowed',
      code: '400', // Bad Request
    };
  }

  // Check if MIME type matches extension (prevent spoofing)
  const allowedMimes = getAllowedMimeTypes(allowedExtensions);
  if (!allowedMimes.has(mimeType)) {
    return {
      isValid: false,
      error: 'File MIME type does not match extension',
      code: '400', // Bad Request
    };
  }

  return { isValid: true };
}

/**
 * Comprehensive file validation
 * Validates both size and type
 */
export function validateFileUpload(
  filename: string,
  fileSizeBytes: number,
  mimeType: string,
  config: ValidationConfig
): ValidationResult {
  // Validate size first
  const sizeResult = validateFileSize(fileSizeBytes, config.maxSizeMB);
  if (!sizeResult.isValid) {
    return sizeResult;
  }

  // Validate type
  const typeResult = validateFileType(filename, mimeType, config.allowedTypes);
  if (!typeResult.isValid) {
    return typeResult;
  }

  return { isValid: true };
}

/**
 * Load and parse file upload configuration from environment variables
 */
export function loadFileValidationConfig(): ValidationConfig {
  const maxSizeStr = process.env.MAX_FILE_SIZE_MB || '50';
  const allowedTypesStr =
    process.env.ALLOWED_FILE_TYPES ||
    'jpg,jpeg,png,gif,mp4,mov,webm,psd,ai';

  const maxSizeMB = parseInt(maxSizeStr, 10);
  if (isNaN(maxSizeMB) || maxSizeMB <= 0) {
    throw new Error(
      `Invalid MAX_FILE_SIZE_MB: "${maxSizeStr}". Must be a positive number.`
    );
  }

  const allowedTypes = allowedTypesStr
    .split(',')
    .map((type) => type.trim().toLowerCase())
    .filter((type) => type.length > 0);

  if (!allowedTypesStr.trim() || allowedTypes.length === 0) {
    throw new Error(
      'No allowed file types configured in ALLOWED_FILE_TYPES'
    );
  }

  return {
    maxSizeMB,
    allowedTypes,
  };
}

/**
 * HTTP status code for validation errors
 */
export function getHttpStatusCode(validationResult: ValidationResult): number {
  if (validationResult.isValid) {
    return 200;
  }

  switch (validationResult.code) {
    case '413':
      return 413; // Payload Too Large
    case '400':
    default:
      return 400; // Bad Request
  }
}
