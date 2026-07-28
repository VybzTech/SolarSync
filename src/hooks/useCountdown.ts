import { useEffect, useState } from 'react'

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  /** True once the target moment has passed. */
  elapsed: boolean
  /** True when no target date is configured. */
  unset: boolean
}

const EMPTY: Countdown = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  elapsed: false,
  unset: true,
}

function compute(target: number): Countdown {
  const diff = target - Date.now()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, elapsed: true, unset: false }
  }
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    elapsed: false,
    unset: false,
  }
}

/** Ticks once per second toward an ISO timestamp. */
export function useCountdown(isoTarget: string | null | undefined): Countdown {
  const [countdown, setCountdown] = useState<Countdown>(() => {
    if (!isoTarget) return EMPTY
    const target = new Date(isoTarget).getTime()
    return Number.isNaN(target) ? EMPTY : compute(target)
  })

  useEffect(() => {
    if (!isoTarget) {
      setCountdown(EMPTY)
      return
    }

    const target = new Date(isoTarget).getTime()
    if (Number.isNaN(target)) {
      setCountdown(EMPTY)
      return
    }

    setCountdown(compute(target))
    const interval = window.setInterval(() => setCountdown(compute(target)), 1000)
    return () => window.clearInterval(interval)
  }, [isoTarget])

  return countdown
}
