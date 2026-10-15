export type NodeTone = 'victim' | 'attacker' | 'target' | 'browser' | 'neutral'
export type PacketTone = 'request' | 'cookie' | 'forged' | 'blocked' | 'good'

export type FlowNode = {
  id: string
  label: string
  sub?: string
  /** Normalised position on the stage (0–100). */
  x: number
  y: number
  tone?: NodeTone
}

export type FlowPacket = {
  from: string
  to: string
  label: string
  /** Scene-relative start (0–1). */
  at: number
  tone?: PacketTone
}

export type BrowserLine =
  | { type: 'text'; value: string }
  | { type: 'field'; label: string; value: string }
  | { type: 'hidden'; label: string; value: string }
  | { type: 'button'; label: string; danger?: boolean }
  | { type: 'note'; value: string }
  | { type: 'flash'; value: string }

export type Visual =
  | { kind: 'title'; title: string; subtitle?: string; badge?: string }
  | { kind: 'bullets'; heading?: string; items: string[] }
  | { kind: 'code'; lang?: string; title?: string; code: string }
  | { kind: 'flow'; nodes: FlowNode[]; packets: FlowPacket[]; note?: string }
  | { kind: 'browser'; url: string; title?: string; lines: BrowserLine[] }
  | { kind: 'impact'; heading: string; before: string; after: string; note?: string }

export type Scene = {
  id: string
  title: string
  caption: string
  /** Seconds this scene plays for. */
  duration: number
  visual: Visual
}

export type Tutorial = {
  id: string
  title: string
  subtitle: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  accent?: 'ember' | 'steel' | 'danger'
  summary: string
  scenes: Scene[]
  keyPoints: string[]
}

export const LEVEL_LABEL: Record<Tutorial['level'], string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export function tutorialDuration(t: Tutorial) {
  return t.scenes.reduce((sum, s) => sum + s.duration, 0)
}

export function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}:${String(rem).padStart(2, '0')}`
}

/** Which scene is active at a given elapsed time, and how far into it we are. */
export function sceneAt(t: Tutorial, elapsed: number) {
  let acc = 0
  for (let i = 0; i < t.scenes.length; i++) {
    const s = t.scenes[i]
    if (elapsed < acc + s.duration || i === t.scenes.length - 1) {
      return { index: i, scene: s, progress: Math.min(1, Math.max(0, (elapsed - acc) / s.duration)), start: acc }
    }
    acc += s.duration
  }
  const last = t.scenes.length - 1
  return { index: last, scene: t.scenes[last], progress: 1, start: acc }
}
