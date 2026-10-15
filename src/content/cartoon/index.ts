import type { Cartoon } from '@/lib/cartoon/types'
import { csrfFundamentals } from './csrf-fundamentals'
import { csrfTypes } from './csrf-types'
import { csrfDefenses } from './csrf-defenses'
import { csrfBypass } from './csrf-bypass'
import { csrfModern } from './csrf-modern'
import { csrfCaseStudies } from './csrf-case-studies'
import { csrfCapstone } from './csrf-capstone'

export const cartoons: Cartoon[] = [
  ...csrfFundamentals,
  ...csrfTypes,
  ...csrfDefenses,
  ...csrfBypass,
  ...csrfModern,
  ...csrfCaseStudies,
  ...csrfCapstone,
]

export type CartoonSeriesGroup = { name: string; cartoons: Cartoon[] }

export const cartoonSeries: CartoonSeriesGroup[] = (() => {
  const groups: CartoonSeriesGroup[] = []
  for (const cartoon of cartoons) {
    let group = groups.find((g) => g.name === cartoon.series)
    if (!group) {
      group = { name: cartoon.series, cartoons: [] }
      groups.push(group)
    }
    group.cartoons.push(cartoon)
  }
  return groups
})()

export function getCartoon(id: string): Cartoon | undefined {
  return cartoons.find((c) => c.id === id)
}
