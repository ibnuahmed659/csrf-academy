import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Clamp a number into an inclusive range. */
export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** Deterministic 32-bit hash (djb2) — used for stable ids like certificate numbers. */
export function hashString(input: string) {
  let h = 5381
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) >>> 0
  return h >>> 0
}

/** Compact relative-time label, e.g. "3 days ago". */
export function timeAgo(iso: string) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const secs = Math.max(1, Math.floor((Date.now() - then) / 1000))
  const units: [number, string][] = [
    [60, 'second'],
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.35, 'week'],
    [12, 'month'],
  ]
  let value = secs
  let name = 'second'
  for (let i = 0; i < units.length; i++) {
    if (value < units[i][0]) {
      name = units[i][1]
      break
    }
    value = value / units[i][0]
    name = i + 1 < units.length ? units[i + 1][1] : 'year'
  }
  const rounded = Math.floor(value)
  return `${rounded} ${name}${rounded === 1 ? '' : 's'} ago`
}
