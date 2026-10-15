export type ActorKind = 'hacker' | 'victim' | 'defender' | 'server' | 'browser' | 'cloud'

export type ActorState = 'idle' | 'walk' | 'type' | 'shock' | 'happy' | 'evil'

export type CartoonActor = {
  id: string
  kind: ActorKind
  name?: string
  x: number
  y: number
  state?: ActorState
  facing?: 'left' | 'right'
  speech?: string
  scale?: number
}

export type EffectKind = 'packet' | 'alert' | 'glow' | 'badge'

export type CartoonEffect = {
  kind: EffectKind
  from?: { x: number; y: number }
  to: { x: number; y: number }
  label?: string
  color?: string
  delay?: number
  duration?: number
  tone?: 'brand' | 'danger' | 'warning' | 'success' | 'accent'
}

export type CartoonScene = {
  id: string
  title: string
  kicker?: string
  caption: string
  duration: number
  background: 'city' | 'room' | 'server-room' | 'web'
  actors: CartoonActor[]
  effects?: CartoonEffect[]
}

export type Cartoon = {
  id: string
  series: string
  number: number
  title: string
  subtitle: string
  summary: string
  tags: string[]
  scenes: CartoonScene[]
}

export type CartoonQuizQuestion = {
  q: string
  options: string[]
  answer: number
}

export type CartoonQuiz = {
  questions: CartoonQuizQuestion[]
}

export const TONE: Record<string, string> = {
  brand: 'var(--color-brand)',
  danger: 'var(--color-danger)',
  warning: 'var(--color-warning)',
  success: 'var(--color-success)',
  accent: 'var(--color-accent)',
}
