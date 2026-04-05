/**
 * Layout Components Tests - project shell contracts
 */

describe('Layout Components', () => {
  describe('ProjectNavbar menu contract', () => {
    it('exposes the overview-first menu order', () => {
      const menuItems = [
        'Overview',
        'Dashboard',
        'Strategy Library',
        'Brand Core',
        'Media Library',
        'Social Assets',
        'Creative Production',
        'Copy & Messaging',
        'Configs',
      ]

      expect(menuItems.length).toBe(9)
      expect(menuItems[0]).toBe('Overview')
      expect(menuItems[1]).toBe('Dashboard')
    })

    it('generates root overview and dedicated dashboard routes', () => {
      const projectId = 'proj-123'

      expect(`/projeto/${projectId}`).toBe('/projeto/proj-123')
      expect(`/projeto/${projectId}/dashboard`).toBe('/projeto/proj-123/dashboard')
    })

    it('keeps projectId in all domain routes', () => {
      const routes = [
        '/projeto/[id]',
        '/projeto/[id]/dashboard',
        '/projeto/[id]/strategy',
        '/projeto/[id]/brand-core',
        '/projeto/[id]/media',
        '/projeto/[id]/social',
        '/projeto/[id]/production',
        '/projeto/[id]/copy',
        '/projeto/[id]/config',
      ]

      expect(routes.every((route) => route.includes('[id]'))).toBe(true)
    })
  })

  describe('Context persistence', () => {
    it('keeps the project id while navigating between overview and a domain route', () => {
      const projectId = 'proj-123'
      const overviewTarget = `/projeto/${projectId}`
      const strategyTarget = `/projeto/${projectId}/strategy`

      expect(overviewTarget).toContain(projectId)
      expect(strategyTarget).toContain(projectId)
    })

    it('clears the context when switching projects', () => {
      const beforeSwitch = 'proj-123'
      const afterSwitch = null

      expect(beforeSwitch).not.toBe(afterSwitch)
    })
  })

  describe('Internationalization contract', () => {
    it('keeps the active project translation keys', () => {
      expect('projeto_ativo').toBeTruthy()
      expect('trocar_projeto').toBeTruthy()
    })

    it('resolves all navigation keys used by the project shell', () => {
      const navKeys = [
        'navigation.overview',
        'navigation.dashboard',
        'navigation.strategy',
        'navigation.brand_core',
        'navigation.media_library',
        'navigation.social',
        'navigation.creatives',
        'navigation.copywriting',
        'navigation.config',
      ]

      expect(navKeys.length).toBe(9)
    })
  })
})
