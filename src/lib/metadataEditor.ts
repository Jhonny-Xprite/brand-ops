const DEFAULT_TAG_LIMIT = 20
const DEFAULT_TAG_SUGGESTION_LIMIT = 8

export const METADATA_TAG_HISTORY_KEY = 'brand-ops:metadata-tag-history'

export function parseTagInput(value: string): string[] {
  const seen = new Set<string>()

  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag !== '')
    .filter((tag) => {
      const normalized = tag.toLowerCase()
      if (seen.has(normalized)) {
        return false
      }

      seen.add(normalized)
      return true
    })
}

export function mergeTagHistory(existingHistory: string[], nextTags: string[]): string[] {
  const merged = [...nextTags, ...existingHistory]
  const seen = new Set<string>()

  return merged.filter((tag) => {
    const normalized = tag.trim().toLowerCase()

    if (!normalized || seen.has(normalized)) {
      return false
    }

    seen.add(normalized)
    return true
  }).slice(0, DEFAULT_TAG_LIMIT)
}

export function buildTagSuggestions(
  currentTags: string[],
  existingTags: string[],
  history: string[],
  query: string,
): string[] {
  const normalizedQuery = query.trim().toLowerCase()
  const selected = new Set(currentTags.map((tag) => tag.toLowerCase()))
  const pool = mergeTagHistory(existingTags, history)

  return pool
    .filter((tag) => !selected.has(tag.toLowerCase()))
    .filter((tag) => (normalizedQuery ? tag.toLowerCase().includes(normalizedQuery) : true))
    .slice(0, DEFAULT_TAG_SUGGESTION_LIMIT)
}

export function readTagHistory(storage: Pick<Storage, 'getItem'>): string[] {
  try {
    const raw = storage.getItem(METADATA_TAG_HISTORY_KEY)
    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : []
  } catch {
    return []
  }
}

export function writeTagHistory(storage: Pick<Storage, 'setItem'>, history: string[]): void {
  storage.setItem(METADATA_TAG_HISTORY_KEY, JSON.stringify(history))
}
