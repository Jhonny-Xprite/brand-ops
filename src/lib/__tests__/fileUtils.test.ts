import { sanitizeFilename, detectFileType } from '../fileUtils';

describe('fileUtils', () => {
  describe('sanitizeFilename', () => {
    it('should remove path information', () => {
      expect(sanitizeFilename('C:\\users\\path\\file.jpg')).toBe('file.jpg');
      expect(sanitizeFilename('/home/user/file.jpg')).toBe('file.jpg');
    });

    it('should replace special characters with underscores', () => {
      expect(sanitizeFilename('file with space!.jpg')).toBe('file_with_space_.jpg');
      expect(sanitizeFilename('file@#$%^&*.jpg')).toBe('file_______.jpg');
    });

    it('should preserve dots, dashes and underscores', () => {
      expect(sanitizeFilename('my-file_v1.0.jpg')).toBe('my-file_v1.0.jpg');
    });
  });

  describe('detectFileType', () => {
    it('should detect images', () => {
      expect(detectFileType('test.jpg')).toBe('image');
      expect(detectFileType('test.PNG')).toBe('image');
      expect(detectFileType('test.webp')).toBe('image');
    });

    it('should detect videos', () => {
      expect(detectFileType('movie.mp4')).toBe('video');
      expect(detectFileType('CLIP.MOV')).toBe('video');
    });

    it('should detect documents', () => {
      expect(detectFileType('resume.pdf')).toBe('document');
      expect(detectFileType('NOTES.TXT')).toBe('document');
    });

    it('should return other for unknown extensions', () => {
      expect(detectFileType('archive.zip')).toBe('other');
      expect(detectFileType('binary.exe')).toBe('other');
      expect(detectFileType('nofile')).toBe('other');
    });
  });
});
