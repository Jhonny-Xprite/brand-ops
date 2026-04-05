import {
  getDefaultProjectBrandProfile,
  resolveProductThemeVariables,
  resolveProjectThemeVariables,
} from '@/lib/theme/themeResolver'

describe('themeResolver', () => {
  it('returns premium product tokens for dark and light modes', () => {
    const dark = resolveProductThemeVariables('dark')
    const light = resolveProductThemeVariables('light')

    expect(dark['--action-primary']).toBeTruthy()
    expect(light['--action-primary']).toBeTruthy()
    expect(dark['--surface-canvas']).not.toEqual(light['--surface-canvas'])
  })

  it('derives project overrides without losing required semantic keys', () => {
    const profile = {
      ...getDefaultProjectBrandProfile(),
      primaryColor: '#2563EB',
      secondaryColor: '#F97316',
      accentColor: '#14B8A6',
      neutralBase: '#1F2937',
      titleFont: 'Manrope',
      bodyFont: 'DM Sans',
    }

    const resolved = resolveProjectThemeVariables(profile, 'dark')

    expect(resolved['--action-primary']).toContain('37 99 235')
    expect(resolved['--font-display']).toContain('Manrope')
    expect(resolved['--font-sans']).toContain('DM Sans')
    expect(resolved['--surface-default']).toBeTruthy()
    expect(resolved['--text-default']).toBeTruthy()
  })
})
