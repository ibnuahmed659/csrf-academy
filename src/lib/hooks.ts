import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

/** Tailwind-style media query hook. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** Respect the user's reduced-motion preference. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/** Lock body scroll while a value is truthy (modals, drawers). */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const { overflow, paddingRight } = document.body.style
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [locked])
}

/** Call a handler when the user presses a key (with ctrl/meta support). */
export function useHotkey(
  key: string,
  handler: (e: KeyboardEvent) => void,
  opts: { meta?: boolean; shift?: boolean } = {},
) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const metaOk = opts.meta ? e.metaKey || e.ctrlKey : true
      const shiftOk = opts.shift ? e.shiftKey : true
      if (e.key.toLowerCase() === key.toLowerCase() && metaOk && shiftOk) {
        handler(e)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [key, opts.meta, opts.shift, handler])
}

/** Detect clicks outside of the referenced element. */
export function useOnClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
) {
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = ref.current
      if (!el || el.contains(e.target as Node)) return
      handler()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [ref, handler])
}

/** Copy text to clipboard and report whether it recently succeeded. */
export function useCopy(timeout = 1600) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        window.setTimeout(() => setCopied(false), timeout)
        return true
      } catch {
        return false
      }
    },
    [timeout],
  )
  return { copied, copy }
}

/** A boolean persisted to localStorage. */
export function useLocalStorage(key: string, initial: boolean) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initial : raw === 'true'
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, String(value))
    } catch {
      /* ignore */
    }
  }, [key, value])
  return [value, setValue] as const
}

/**
 * Drives a timeline clock. `running` gates whether time advances. Returns the
 * elapsed seconds and a manual setter (used by scrubbing).
 */
export function useClock({
  duration,
  running,
  onDone,
  speed = 1,
}: {
  duration: number
  running: boolean
  onDone?: () => void
  speed?: number
}) {
  const [t, setT] = useState(0)
  const raf = useRef(0)
  const last = useRef(0)
  const doneRef = useRef(onDone)

  useEffect(() => {
    doneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    if (!running) return
    last.current = performance.now()
    const tick = (now: number) => {
      const dt = ((now - last.current) / 1000) * speed
      last.current = now
      setT((prev) => {
        const next = prev + dt
        if (next >= duration) {
          doneRef.current?.()
          return duration
        }
        return next
      })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [running, duration, speed])

  const reset = useCallback(() => setT(0), [])
  return { t, setT, reset }
}
