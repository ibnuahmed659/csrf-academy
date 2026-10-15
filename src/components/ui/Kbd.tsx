import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        'inline-flex min-w-[1.5rem] items-center justify-center rounded border border-line-strong bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-muted shadow-[inset_0_-1px_0_var(--line-strong)]',
        className,
      )}
      {...props}
    />
  )
}
