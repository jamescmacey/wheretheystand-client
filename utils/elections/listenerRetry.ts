/**
 * How hard a live listener tries again after Firestore gives up on it.
 *
 * The SDK reconnects a dropped network connection on its own and never reports
 * that as an error. What reaches a listener's error callback is terminal: the
 * listener is dead and delivers nothing more. The likeliest causes on the night
 * are temporary in a way the SDK cannot know -- an index still building, rules
 * deployed a minute late -- so they are worth a few more attempts.
 *
 * The same budget as the feed's: five attempts at a widening interval, roughly
 * four minutes in all. Bounded, because each attempt pays the listener's
 * opening reads again, and a read that is genuinely denied never succeeds.
 */
export const LISTENER_RETRY_ATTEMPTS = 5
export const LISTENER_RETRY_DELAY_MS = 15_000

export interface ListenerRetry {
  /**
   * Run `run` again after the next delay, unless one is already pending.
   *
   * Returns false once the budget is spent, which is the caller's cue to stop
   * saying it is reconnecting.
   */
  schedule: (run: () => void) => boolean
  /** Restore the full budget, after a delivery or a reader's own retry. */
  reset: () => void
  /** Drop any pending attempt. */
  cancel: () => void
}

export function createListenerRetry(
  attempts = LISTENER_RETRY_ATTEMPTS,
  delayMs = LISTENER_RETRY_DELAY_MS,
): ListenerRetry {
  let timer: ReturnType<typeof setTimeout> | null = null
  let attemptsLeft = attempts

  function cancel() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return {
    schedule(run) {
      if (timer) return true
      if (attemptsLeft <= 0) return false
      const delay = delayMs * (attempts - attemptsLeft + 1)
      attemptsLeft -= 1
      timer = setTimeout(() => {
        timer = null
        run()
      }, delay)
      return true
    },
    reset() {
      cancel()
      attemptsLeft = attempts
    },
    cancel,
  }
}
