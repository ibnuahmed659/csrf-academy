import { Trash2, Send, History } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import {
  HttpInspector,
  type Finding,
  type HttpRequest,
  type HttpResponse,
} from './HttpInspector'

export type ExchangeKind = 'legit' | 'forged' | 'nav'

export interface Exchange {
  id: number
  kind: ExchangeKind
  request: HttpRequest
  response: HttpResponse | null
  findings: Finding[]
  /** Intercepted and waiting for the operator to forward it. */
  pending?: boolean
  pwned?: boolean
  blockedBy?: string
}

const KIND_LABEL: Record<ExchangeKind, string> = {
  legit: 'same-origin',
  forged: 'cross-site',
  nav: 'navigation',
}

const KIND_CLS: Record<ExchangeKind, string> = {
  legit: 'border-line bg-surface-2 text-muted',
  forged: 'border-danger/40 bg-danger-soft text-danger',
  nav: 'border-line bg-surface-2 text-muted',
}

function statusOf(ex: Exchange): { label: string; cls: string } {
  if (ex.pending) return { label: 'intercepted', cls: 'text-danger' }
  if (ex.kind === 'forged' && ex.pwned) return { label: ex.response?.status ?? 'applied', cls: 'text-danger' }
  if (ex.kind === 'forged' && ex.blockedBy) return { label: '403 blocked', cls: 'text-success' }
  return { label: ex.response?.status ?? 'sent', cls: 'text-muted' }
}

export interface ProxyPanelProps {
  exchanges: Exchange[]
  selectedId: number | null
  onSelect: (id: number) => void
  onForward?: (id: number) => void
  onDrop?: (id: number) => void
  /** Title shown in the panel header. */
  title?: string
  toolbar?: ReactNode
  className?: string
}

export function ProxyPanel({
  exchanges,
  selectedId,
  onSelect,
  onForward,
  onDrop,
  title = 'Intercepting proxy',
  toolbar,
  className,
}: ProxyPanelProps) {
  const selected = exchanges.find((e) => e.id === selectedId) ?? exchanges[exchanges.length - 1] ?? null

  return (
    <div className={cn('overflow-hidden rounded-xl border border-code-line bg-code shadow-card', className)}>
      <div className="flex flex-wrap items-center gap-2 border-b border-code-line px-3 py-2">
        <History className="size-3.5 text-code-fg/60" />
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-code-fg/60">{title}</span>
        <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-code-fg/60">
          {exchanges.length} {exchanges.length === 1 ? 'request' : 'requests'}
        </span>
        {toolbar && <div className="ml-auto flex items-center gap-1.5">{toolbar}</div>}
      </div>

      {/* HTTP history list */}
      {exchanges.length > 0 && (
        <ul className="max-h-40 overflow-y-auto border-b border-code-line py-1 font-mono text-[11.5px]">
          {exchanges.map((ex) => {
            const status = statusOf(ex)
            const active = ex.id === selected?.id
            return (
              <li key={ex.id}>
                <button
                  type="button"
                  onClick={() => onSelect(ex.id)}
                  className={cn(
                    'flex w-full items-center gap-2 px-3 py-1 text-left transition',
                    active ? 'bg-white/10' : 'hover:bg-white/5',
                  )}
                >
                  <span
                    className={cn(
                      'shrink-0 rounded border px-1 text-[9.5px] font-bold uppercase',
                      KIND_CLS[ex.kind],
                    )}
                  >
                    {KIND_LABEL[ex.kind]}
                  </span>
                  <span className="w-11 shrink-0 font-bold text-brand">{ex.request.method}</span>
                  <span className="min-w-0 flex-1 truncate text-code-fg">{ex.request.path}</span>
                  <span className={cn('shrink-0', status.cls)}>{status.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {selected ? (
        <HttpInspector
          request={selected.request}
          response={selected.response}
          findings={selected.findings}
          intercepting={selected.pending}
          actions={
            selected.pending ? (
              <>
                {onForward && (
                  <Button variant="danger" size="sm" onClick={() => onForward(selected.id)}>
                    <Send className="size-3.5" /> Forward
                  </Button>
                )}
                {onDrop && (
                  <Button variant="ghost" size="sm" onClick={() => onDrop(selected.id)}>
                    <Trash2 className="size-3.5" /> Drop
                  </Button>
                )}
              </>
            ) : undefined
          }
        />
      ) : (
        <div className="px-3.5 py-6 text-center font-mono text-[12px] text-code-fg/50">
          No requests captured yet.
        </div>
      )}
    </div>
  )
}
