import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import usePWAInstall from '@/hooks/usePWAInstall'

describe('PWA Installation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('starts as not installable', () => {
    const { result } = renderHook(() => usePWAInstall())
    expect(result.current.isInstallable).toBe(false)
  })

  it('becomes installable when beforeinstallprompt fires', () => {
    const { result } = renderHook(() => usePWAInstall())
    expect(result.current.isInstallable).toBe(false)

    act(() => {
      const event = new Event('beforeinstallprompt')
      window.dispatchEvent(event)
    })

    expect(result.current.isInstallable).toBe(true)
  })

  it('becomes not installable after appinstalled event', () => {
    const { result } = renderHook(() => usePWAInstall())

    act(() => {
      window.dispatchEvent(new Event('beforeinstallprompt'))
    })

    expect(result.current.isInstallable).toBe(true)

    act(() => {
      window.dispatchEvent(new Event('appinstalled'))
    })

    expect(result.current.isInstallable).toBe(false)
  })

  it('calls prompt and returns outcome when promptInstall is invoked', async () => {
    const { result } = renderHook(() => usePWAInstall())

    act(() => {
      const event = new Event('beforeinstallprompt')
      Object.defineProperty(event, 'prompt', { value: vi.fn().mockResolvedValue(undefined) })
      Object.defineProperty(event, 'userChoice', { value: Promise.resolve({ outcome: 'accepted' }) })
      window.dispatchEvent(event)
    })

    expect(result.current.isInstallable).toBe(true)

    let outcome: string | null = null
    await act(async () => {
      outcome = await result.current.promptInstall()
    })

    expect(outcome).toBe('accepted')
    expect(result.current.isInstallable).toBe(false)
  })

  it('cleans up event listeners on unmount', () => {
    const beforeInstallSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => usePWAInstall())

    expect(beforeInstallSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function))
    expect(beforeInstallSpy).toHaveBeenCalledWith('appinstalled', expect.any(Function))

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('appinstalled', expect.any(Function))
  })
})
