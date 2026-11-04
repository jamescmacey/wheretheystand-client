import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createListenerRetry } from '~/utils/elections/listenerRetry'

describe('createListenerRetry', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('retries at a widening interval and then gives up', () => {
    const retry = createListenerRetry(2, 1000)
    const run = vi.fn()

    expect(retry.schedule(run)).toBe(true)
    vi.advanceTimersByTime(999)
    expect(run).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(run).toHaveBeenCalledTimes(1)

    expect(retry.schedule(run)).toBe(true)
    vi.advanceTimersByTime(1999)
    expect(run).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1)
    expect(run).toHaveBeenCalledTimes(2)

    expect(retry.schedule(run)).toBe(false)
  })

  it('does not stack attempts while one is pending', () => {
    const retry = createListenerRetry(3, 1000)
    const run = vi.fn()
    retry.schedule(run)
    expect(retry.schedule(run)).toBe(true)
    vi.advanceTimersByTime(10_000)
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('restores the budget on reset and drops a pending attempt', () => {
    const retry = createListenerRetry(1, 1000)
    const run = vi.fn()
    retry.schedule(run)
    retry.reset()
    vi.advanceTimersByTime(5000)
    expect(run).not.toHaveBeenCalled()
    expect(retry.schedule(run)).toBe(true)
    vi.advanceTimersByTime(1000)
    expect(run).toHaveBeenCalledTimes(1)
  })
})
