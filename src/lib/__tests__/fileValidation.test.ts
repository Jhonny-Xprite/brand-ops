import {
  validateFileSize,
  validateFileType,
  validateFileUpload,
  loadFileValidationConfig,
  getHttpStatusCode,
} from '../fileValidation';

describe('File Validation Utility', () => {
  describe('validateFileSize', () => {
    it('should accept files under the size limit', () => {
      const result = validateFileSize(1024 * 1024, 50); // 1MB, 50MB limit
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files over the size limit', () => {
      const result = validateFileSize(51 * 1024 * 1024, 50); // 51MB, 50MB limit
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds maximum allowed size');
      expect(result.code).toBe('413');
    });

    it('should handle exact size limit boundary', () => {
      const result = validateFileSize(50 * 1024 * 1024, 50); // Exactly 50MB
      expect(result.isValid).toBe(true);
    });

    it('should reject files exactly at limit + 1 byte', () => {
      const result = validateFileSize(50 * 1024 * 1024 + 1, 50);
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('413');
    });
  });

  describe('validateFileType', () => {
    const allowedTypes = ['jpg', 'jpeg', 'png', 'mp4', 'psd'];

    it('should accept valid file types with correct MIME', () => {
      const result = validateFileType('image.jpg', 'image/jpeg', allowedTypes);
      expect(result.isValid).toBe(true);
    });

    it('should accept PNG files', () => {
      const result = validateFileType('photo.png', 'image/png', allowedTypes);
      expect(result.isValid).toBe(true);
    });

    it('should accept MP4 videos', () => {
      const result = validateFileType('video.mp4', 'video/mp4', allowedTypes);
      expect(result.isValid).toBe(true);
    });

    it('should reject disallowed file extensions', () => {
      const result = validateFileType('script.exe', 'application/octet-stream', allowedTypes);
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('400');
      expect(result.error).toContain('File type not allowed');
    });

    it('should reject spoofed file extensions with wrong MIME type', () => {
      const result = validateFileType('image.jpg', 'application/octet-stream', allowedTypes);
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('400');
      expect(result.error).toContain('MIME type does not match');
    });

    it('should handle case-insensitive extensions', () => {
      const result = validateFileType('image.JPG', 'image/jpeg', allowedTypes);
      expect(result.isValid).toBe(true);
    });

    it('should reject PDF files', () => {
      const result = validateFileType('document.pdf', 'application/pdf', allowedTypes);
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('400');
    });

    it('should handle alternative MIME types for same extension', () => {
      // Photoshop files can have multiple MIME types
      const result1 = validateFileType('design.psd', 'application/photoshop', allowedTypes);
      const result2 = validateFileType('design.psd', 'image/vnd.adobe.photoshop', allowedTypes);
      expect(result1.isValid).toBe(true);
      expect(result2.isValid).toBe(true);
    });
  });

  describe('validateFileUpload', () => {
    const config = {
      maxSizeMB: 50,
      allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'webm', 'psd', 'ai'],
    };

    it('should accept valid files', () => {
      const result = validateFileUpload(
        'photo.jpg',
        1024 * 1024,
        'image/jpeg',
        config
      );
      expect(result.isValid).toBe(true);
    });

    it('should reject oversized files', () => {
      const result = validateFileUpload(
        'huge-video.mp4',
        51 * 1024 * 1024,
        'video/mp4',
        config
      );
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('413');
    });

    it('should reject invalid file types', () => {
      const result = validateFileUpload(
        'executable.exe',
        1024 * 1024,
        'application/octet-stream',
        config
      );
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('400');
    });

    it('should validate multiple file formats', () => {
      const files = [
        { name: 'photo.jpg', size: 2 * 1024 * 1024, mime: 'image/jpeg' },
        { name: 'video.mp4', size: 100 * 1024 * 1024, mime: 'video/mp4' },
        { name: 'design.psd', size: 50 * 1024 * 1024, mime: 'application/photoshop' },
      ];

      files.forEach((file) => {
        // Note: 100MB video will be rejected by size limit in this config
        const expectedValid = file.size <= 50 * 1024 * 1024;
        const result = validateFileUpload(file.name, file.size, file.mime, config);
        expect(result.isValid).toBe(expectedValid);
      });
    });
  });

  describe('loadFileValidationConfig', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should load default configuration', () => {
      delete process.env.MAX_FILE_SIZE_MB;
      delete process.env.ALLOWED_FILE_TYPES;

      const config = loadFileValidationConfig();
      expect(config.maxSizeMB).toBe(50);
      expect(config.allowedTypes).toContain('jpg');
      expect(config.allowedTypes).toContain('mp4');
    });

    it('should load custom configuration from env vars', () => {
      process.env.MAX_FILE_SIZE_MB = '100';
      process.env.ALLOWED_FILE_TYPES = 'pdf,doc,docx';

      const config = loadFileValidationConfig();
      expect(config.maxSizeMB).toBe(100);
      expect(config.allowedTypes).toEqual(['pdf', 'doc', 'docx']);
    });

    it('should throw on invalid MAX_FILE_SIZE_MB', () => {
      process.env.MAX_FILE_SIZE_MB = 'invalid';
      expect(() => loadFileValidationConfig()).toThrow(
        'Invalid MAX_FILE_SIZE_MB'
      );
    });

    it('should throw on negative MAX_FILE_SIZE_MB', () => {
      process.env.MAX_FILE_SIZE_MB = '-10';
      expect(() => loadFileValidationConfig()).toThrow(
        'Invalid MAX_FILE_SIZE_MB'
      );
    });

    it('should trim whitespace from file types', () => {
      process.env.ALLOWED_FILE_TYPES = ' jpg , png , mp4 ';
      const config = loadFileValidationConfig();
      expect(config.allowedTypes).toEqual(['jpg', 'png', 'mp4']);
    });
  });

  describe('getHttpStatusCode', () => {
    it('should return 200 for valid files', () => {
      const result = { isValid: true };
      expect(getHttpStatusCode(result)).toBe(200);
    });

    it('should return 413 for oversized files', () => {
      const result = { isValid: false, code: '413' };
      expect(getHttpStatusCode(result)).toBe(413);
    });

    it('should return 400 for invalid file types', () => {
      const result = { isValid: false, code: '400' };
      expect(getHttpStatusCode(result)).toBe(400);
    });

    it('should default to 400 for unknown error codes', () => {
      const result = { isValid: false, code: 'UNKNOWN' };
      expect(getHttpStatusCode(result)).toBe(400);
    });
  });
});
