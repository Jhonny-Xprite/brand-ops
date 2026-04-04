import {
  buildTagSuggestions,
  mergeTagHistory,
  parseTagInput,
  readTagHistory,
} from '@/lib/metadataEditor'

describe('metadataEditor utils', () => {
  it('parses unique tags from comma-separated input', () => {
    expect(parseTagInput('Brand, social, brand , campaign')).toEqual(['Brand', 'social', 'campaign'])
  })

  it('merges tag history with recency and uniqueness preserved', () => {
    expect(mergeTagHistory(['social', 'brand'], ['Campaign', 'social'])).toEqual([
      'Campaign',
      'social',
      'brand',
    ])
  })

  it('builds suggestions from history and existing tags excluding selected ones', () => {
    expect(
      buildTagSuggestions(['brand'], ['campaign', 'social'], ['brand', 'launch'], 'la'),
    ).toEqual(['launch'])
  })

  it('returns empty history for invalid storage payloads', () => {
    const storage = {
      getItem: () => 'not-json',
    }

    expect(readTagHistory(storage)).toEqual([])
  })
})
