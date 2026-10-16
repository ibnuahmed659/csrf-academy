import { AlertTriangle, Info, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type HeaderFlag = 'default' | 'suspect' | 'good' | 'muted'

export interface HttpHeader {
  name: string
  value: string
  flag?: HeaderFlag
  note?: string
}

export interface HttpRequest {
  method: 'GET' | 'POST'
  path: string
  version?: string
  headers: HttpHeader[]
  body?: string
}

export interface HttpResponse {
  version?: string
  status: string
  headers: HttpHeader[]
  body?: string
}

export type FindingLevel = 'danger' | 'warning' | 'success' | 'info'

export interface Finding {
  level: FindingLevel
  title: string
  detail: string
}

const FLAG_STYLE: Record<HeaderFlag, string> = {
  default: 'text-code-fg',
  suspect: 'text-danger',
  good: 'text-success',
  muted: 'text-code-fg/55',
}

const FINDING_STYLE: Record<FindingLevel, { ring: string; text: string; Icon: typeof Info }> = {
  danger: { ring: 'border-danger/40 bg-danger-soft', text: 'text-danger', Icon: ShieldAlert },
  warning: { ring: 'border-warning/40 bg-warning-soft', text: 'text-warning', Icon: AlertTriangle },
  success: { ring: 'border-success/40 bg-success-soft', text: 'text-success', Icon: ShieldCheck },
  info: { ring: 'border-line bg-surface-2', text: 'text-muted', Icon: Info },
}

export interface HttpInspectorProps {
  request: HttpRequest
  response?: HttpResponse | null
  findings: Finding[]
  intercepting?: boolean
  actions?: ReactNode
  className?: string
}

type Tab = 'request' | 'response' | 'findings'

export function HttpInspector({
  request,
  response,
  findings,
  intercepting,
  actions,
  className,
}: HttpInspectorProps) {
  const [tab, setTab] = useState<Tab>('request')
  const activeTab: Tab = tab === 'response' && !response ? 'request' : tab

  const dangerCount = findings.filter((f) => f.level === 'danger').length

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-code-line bg-code shadow-card',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-code-line px-3 py-2">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-code-fg/60">
          Intercepting proxy
        </span>
        {intercepting && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-danger">
            <span className="size-1.5 animate-pulse rounded-full bg-danger" /> intercepted
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {(response ? (['request', 'response', 'findings'] as Tab[]) : (['request', 'findings'] as Tab[])).map(
            (t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  'rounded px-2 py-1 text-[11px] font-semibold capitalize transition',
                  activeTab === t
                    ? 'bg-white/10 text-code-fg'
                    : 'text-code-fg/50 hover:text-code-fg',
                )}
              >
                {t}
                {t === 'findings' && dangerCount > 0 && (
                  <span className="ml-1 rounded-full bg-danger/30 px-1.5 text-[10px] text-danger">
                    {findings.length}
                  </span>
                )}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto p-3.5 font-mono text-[12.5px] leading-relaxed">
        {activeTab === 'request' && <RawRequest request={request} />}
        {activeTab === 'response' && response && <RawResponse response={response} />}
        {activeTab === 'findings' && <Findings findings={findings} />}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 border-t border-code-line bg-code-2 px-3 py-2.5">
          {actions}
        </div>
      )}
    </div>
  )
}

function RawRequest({ request }: { request: HttpRequest }) {
  return (
    <div className="whitespace-pre-wrap break-all">
      <div>
        <span className="text-brand">{request.method}</span>{' '}
        <span className="text-code-fg">{request.path}</span>{' '}
        <span className="text-code-fg/50">{request.version ?? 'HTTP/1.1'}</span>
      </div>
      {request.headers.map((h) => (
        <div key={h.name} className={FLAG_STYLE[h.flag ?? 'default']}>
          {h.name}: {h.value}
          {h.flag === 'suspect' && (
            <span className="ml-2 text-[10px] font-bold uppercase not-italic text-danger">
              ← flagged
            </span>
          )}
        </div>
      ))}
      {request.body != null && request.body !== '' && (
        <>
          <div className="my-1 h-px bg-code-line" />
          <div className="text-code-fg">{request.body}</div>
        </>
      )}
    </div>
  )
}

function RawResponse({ response }: { response: HttpResponse }) {
  const refused = /^[45]/.test(response.status)
  return (
    <div className="whitespace-pre-wrap break-all">
      <div>
        <span className={refused ? 'text-danger' : 'text-success'}>
          {response.version ?? 'HTTP/1.1'} {response.status}
        </span>
      </div>
      {response.headers.map((h) => (
        <div key={h.name} className={FLAG_STYLE[h.flag ?? 'default']}>
          {h.name}: {h.value}
        </div>
      ))}
      {response.body != null && (
        <>
          <div className="my-1 h-px bg-code-line" />
          <div className="text-code-fg">{response.body}</div>
        </>
      )}
    </div>
  )
}

function Findings({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) {
    return <p className="font-sans text-sm text-code-fg/60">No observations.</p>
  }
  return (
    <ul className="flex flex-col gap-2.5 font-sans">
      {findings.map((f, i) => {
        const style = FINDING_STYLE[f.level]
        const Icon = style.Icon
        return (
          <li key={i} className={cn('flex gap-3 rounded-lg border p-3', style.ring)}>
            <Icon className={cn('mt-0.5 size-4 shrink-0', style.text)} />
            <div>
              <p className="text-[13px] font-semibold text-ink">{f.title}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{f.detail}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
