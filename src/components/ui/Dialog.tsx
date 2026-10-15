import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useOnClickOutside, useScrollLock } from '@/lib/hooks'
import { useRef } from 'react'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  className?: string
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDivElement>(null)
  useScrollLock(open)
  useOnClickOutside(ref, onClose)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-[10vh] backdrop-blur-sm">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        className={cn(
          'scene-in w-full max-w-lg rounded-xl border border-line bg-surface shadow-pop',
          className,
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 p-5 pb-3">
            <div className="flex flex-col gap-1">
              {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
              {description && <p className="text-sm text-muted">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md p-1 text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
        <div className="p-5 pt-2">{children}</div>
      </div>
    </div>
  )
}
