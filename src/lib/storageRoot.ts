import fs from 'fs'
import path from 'path'

const DEFAULT_STORAGE_ROOT = path.join(process.cwd(), 'data', 'storage')

export function getStorageRoot(): string {
  const configuredRoot = process.env.STORAGE_ROOT?.trim()

  if (configuredRoot) {
    return path.resolve(configuredRoot)
  }

  return DEFAULT_STORAGE_ROOT
}

export const STORAGE_ROOT = getStorageRoot()

export function ensureStorageRoot(root = STORAGE_ROOT): string {
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true })
  }

  return root
}

export function getFilesystemErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : null

  if (code === 'EACCES' || code === 'EPERM') {
    return 'Permissao negada. Verifique as permissoes da pasta e tente novamente.'
  }

  if (code === 'ENOSPC') {
    return 'O armazenamento esta cheio. Libere espaco e tente novamente.'
  }

  return 'A pasta de armazenamento nao esta disponivel. Verifique o caminho local e tente novamente.'
}
