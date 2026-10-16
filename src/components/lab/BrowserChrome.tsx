import { ChevronLeft, ChevronRight, Lock, LockOpen, RotateCw, Star } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type BrowserKind = 'victim' | 'attacker'

const ACCENT: Record<BrowserKind, { dot: string; ring: string; badge: string; label: string }> = {
  victim: {
    dot: 'bg-accent',
    ring: 'ring-accent/40',
    badge: 'bg-accent-soft text-accent',
    label: 'Victim browser',
  },
  attacker: {
    dot: 'bg-danger',
    ring: 'ring-danger/40',
    badge: 'bg-danger-soft text-danger',
    label: 'Attacker browser',
  },
}

export interface Bookmark {
  label: string
  url: string
}

export interface BrowserChromeProps {
  kind: BrowserKind
  url: string
  tabTitle: string
  /** Show a padlock for a trusted https origin, or an open lock for a foreign one. */
  trusted?: boolean
  /** When provided, the address bar becomes editable and navigations call this. */
  onNavigate?: (url: string) => void
  /** Enable the back button and report a click. */
  onBack?: () => void
  canGoBack?: boolean
  /** Quick-jump chips rendered under the address bar (like a bookmarks bar). */
  bookmarks?: Bookmark[]
  /** Optional floating label shown on the toolbar, e.g. the logged-in user. */
  identity?: ReactNode
  toolbar?: ReactNode
  className?: string
  bodyClassName?: string
  children: ReactNode
}

export function BrowserChrome({
  kind,
  url,
  tabTitle,
  trusted,
  onNavigate,
  onBack,
  canGoBack,
  bookmarks,
  identity,
  toolbar,
  className,
  bodyClassName,
  children,
}: BrowserChromeProps) {
  const accent = ACCENT[kind]
  const isTrusted = trusted ?? url.startsWith('https://vault.example')
  const [draft, setDraft] = useState(url)
  const [editing, setEditing] = useState(false)

  // Keep the address in sync when the caller navigates externally.
  const shown = editing ? draft : url

  const commit = () => {
    const value = draft.trim()
    if (value && onNavigate) onNavigate(value)
    setEditing(false)
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-line bg-surface shadow-card',
        className,
      )}
    >
      {/* Top chrome */}
      <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', accent.badge)}>
          {accent.label}
        </span>
        <div className="ml-auto flex items-center gap-2">{toolbar}</div>
      </div>

      {/* Tab strip */}
      <div className="flex items-end gap-2 bg-surface-2 px-3 pt-2">
        <div className="flex max-w-[240px] items-center gap-2 rounded-t-lg border border-b-0 border-line bg-surface px-3 py-1.5">
          <span className={cn('size-2 rounded-full', accent.dot)} />
          <span className="truncate text-[12px] font-medium text-ink">{tabTitle}</span>
        </div>
        {identity && <div className="pb-1.5">{identity}</div>}
      </div>

      {/* Nav bar / address bar */}
      <div className="flex items-center gap-2 border-b border-line bg-surface px-3 py-2">
        <div className="flex items-center gap-1 text-faint">
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            aria-label="Back"
            className={cn(
              'grid size-5 place-items-center rounded transition',
              canGoBack ? 'hover:bg-surface-3 hover:text-ink' : 'opacity-40',
            )}
          >
            <ChevronLeft className="size-4" />
          </button>
          <ChevronRight className="size-4 opacity-40" />
          <RotateCw className="size-3.5 opacity-40" />
        </div>
        <div
          className={cn(
            'flex min-w-0 flex-1 items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1.5',
            !isTrusted && 'border-danger/40 bg-danger-soft',
          )}
        >
          {isTrusted ? (
            <Lock className="size-3.5 shrink-0 text-success" />
          ) : (
            <LockOpen className="size-3.5 shrink-0 text-danger" />
          )}
          {onNavigate ? (
            <input
              value={shown}
              onChange={(e) => {
                setEditing(true)
                setDraft(e.target.value)
              }}
              onFocus={() => {
                setDraft(url)
                setEditing(true)
              }}
              onBlur={() => {
                setEditing(false)
                setDraft(url)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit()
                if (e.key === 'Escape') {
                  setDraft(url)
                  setEditing(false)
                }
              }}
              spellCheck={false}
              className={cn(
                'min-w-0 flex-1 bg-transparent font-mono text-[12px] outline-none',
                isTrusted ? 'text-muted' : 'text-danger',
              )}
            />
          ) : (
            <span
              className={cn(
                'truncate font-mono text-[12px]',
                isTrusted ? 'text-muted' : 'text-danger',
              )}
            >
              {url}
            </span>
          )}
          <Star className="ml-auto size-3.5 shrink-0 text-faint" />
        </div>
      </div>

      {/* Bookmarks bar */}
      {bookmarks && bookmarks.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-surface px-3 py-1.5">
          {bookmarks.map((b) => (
            <button
              key={b.url}
              type="button"
              onClick={() => onNavigate?.(b.url)}
              className={cn(
                'max-w-[180px] truncate rounded border border-line bg-surface-2 px-2 py-0.5 font-mono text-[10.5px] text-muted transition hover:border-line-strong hover:text-ink',
                !isTrusted && 'hover:border-danger/40',
              )}
              title={b.url}
            >
              {b.label}
            </button>
          ))}
        </div>
      )}

      {/* Page body */}
      <div className={cn('bg-canvas', bodyClassName)}>{children}</div>
    </div>
  )
}
