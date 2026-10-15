import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'forge'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-3 text-muted ring-line',
  brand: 'bg-brand-soft text-brand ring-transparent',
  accent: 'bg-accent-soft text-accent ring-transparent',
  success: 'bg-success-soft text-success ring-transparent',
  warning: 'bg-warning-soft text-warning ring-transparent',
  danger: 'bg-danger-soft text-danger ring-transparent',
  forge: 'bg-brand-soft text-brand ring-transparent',
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
}

export function Badge({ tone = 'neutral', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset',
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
