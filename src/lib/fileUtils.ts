import path from 'path';

/**
 * Sanitiza o nome do arquivo para remover caracteres não permitidos e prevenir path traversal.
 */
export function sanitizeFilename(filename: string): string {
  // Remove caminhos e carateres problemáticos
  const basename = path.basename(filename);
  // Permite apenas letras, números, pontos, hifens e underscores
  return basename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

/**
 * Detecta o tipo do arquivo com base na extensão.
 * Tipos: image, video, carousel, document, other
 */
export function detectFileType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];
  const documentExtensions = ['.pdf', '.docx', '.txt', '.md', '.doc', '.xls', '.xlsx'];
  
  if (imageExtensions.includes(ext)) return 'image';
  if (videoExtensions.includes(ext)) return 'video';
  if (documentExtensions.includes(ext)) return 'document';
  
  // Carousel normalmente é uma coleção de imagens, mas se houver uma extensão específica ou padrão, detectamos aqui.
  // No Story 1.0, "carousel" é uma opção do dropdown, mas o auto-detect foca no básico.
  
  return 'other';
}
