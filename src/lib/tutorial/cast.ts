import type { FlowNode } from './types'

/*
 * Shared cast for the animated flow diagrams in the video tutorials.
 * Positions are normalised (0–100) so they scale to any stage size.
 */
export const ATTACKER: FlowNode = {
  id: 'attacker',
  label: 'Attacker site',
  sub: 'evil.example',
  x: 15,
  y: 22,
  tone: 'attacker',
}
export const VICTIM: FlowNode = {
  id: 'victim',
  label: 'Victim',
  sub: 'signed in',
  x: 15,
  y: 80,
  tone: 'victim',
}
export const BROWSER: FlowNode = {
  id: 'browser',
  label: "Victim's browser",
  sub: 'trusts cookies',
  x: 50,
  y: 51,
  tone: 'browser',
}
export const TARGET: FlowNode = {
  id: 'target',
  label: 'Target site',
  sub: 'vault.example',
  x: 85,
  y: 51,
  tone: 'target',
}
