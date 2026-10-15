import { cn } from '@/lib/utils'

export interface ProgressProps {
  value: number
  max?: number
  className?: string
  tone?: 'brand' | 'success' | 'accent'
  label?: string
}

const tones = {
  brand: 'bg-brand',
  success: 'bg-success',
  accent: 'bg-accent',
}

export function Progress({
  value,
  max = 100,
  className,
  tone = 'brand',
  label,
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-3', className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-500 ease-[var(--ease-forge)]',
          tones[tone],
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
