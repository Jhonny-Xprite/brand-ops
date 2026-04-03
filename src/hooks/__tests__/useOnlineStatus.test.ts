/**
 * @jest-environment jsdom
 *
 * Tests for useOnlineStatus hook
 * Verifies:
 * - Hook returns correct initial state
 * - Online event listener updates state
 * - Offline event listener updates state
 * - Cleanup removes event listeners (no memory leaks)
 * - SSR-safe (doesn't error when navigator is undefined)
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { useOnlineStatus } from '../useOnlineStatus'

describe('useOnlineStatus Hook', () => {
  beforeEach(() => {
    // Clear console logs between tests
    jest.clearAllMocks()
  })

  it('should initialize with navigator.onLine value', () => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })

    const { result } = renderHook(() => useOnlineStatus())

    expect(result.current.isOnline).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle online event', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    })

    const { result } = renderHook(() => useOnlineStatus())

    expect(result.current.isOnline).toBe(false)

    act(() => {
      // Simulate going online
      const event = new Event('online')
      window.dispatchEvent(event)
    })

    await waitFor(() => {
      expect(result.current.isOnline).toBe(true)
    })
  })

  it('should handle offline event', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })

    const { result } = renderHook(() => useOnlineStatus())

    expect(result.current.isOnline).toBe(true)

    act(() => {
      // Simulate going offline
      const event = new Event('offline')
      window.dispatchEvent(event)
    })

    await waitFor(() => {
      expect(result.current.isOnline).toBe(false)
    })
  })

  it('should cleanup event listeners on unmount', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useOnlineStatus())

    // Verify listeners were added
    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))

    unmount()

    // Verify listeners were removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'online',
      expect.any(Function)
    )
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'offline',
      expect.any(Function)
    )

    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  it('should be SSR-safe (handle undefined navigator)', () => {
    const originalNavigator = global.navigator
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      configurable: true,
    })

    // Should not throw error
    const { result } = renderHook(() => useOnlineStatus())

    // Should return true as default for SSR
    expect(result.current.isOnline).toBe(true)

    // Restore navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      configurable: true,
    })
  })

  it('should log state changes', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    })

    const { result } = renderHook(() => useOnlineStatus())

    expect(result.current.isOnline).toBe(true)

    act(() => {
      const event = new Event('offline')
      window.dispatchEvent(event)
    })

    expect(consoleSpy).toHaveBeenCalledWith('[useOnlineStatus] Going offline')

    consoleSpy.mockRestore()
  })
})
