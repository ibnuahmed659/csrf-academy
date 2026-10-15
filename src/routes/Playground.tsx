import { AlertTriangle, Check, Play, ShieldAlert, ShieldCheck, Terminal } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { AttackResult, Defense, DefenseKey, LabScenario, Vector } from '@/lib/lab'
import { VECTORS, attackSnippet, runCsrf } from '@/lib/lab'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { Segmented } from '@/components/ui/Segmented'
import { Switch } from '@/components/ui/Switch'
import { cn } from '@/lib/utils'

const INITIAL_DEFENSE: Defense = {
  requirePost: false,
  token: 'none',
  sameSite: 'none',
  originCheck: false,
  customHeader: false,
  tokenMethodBound: false,
  methodOverride: false,
  refererCheck: 'off',
  cookieInjection: 'none',
  clientRedirect: false,
  siblingXss: false,
}

export default function Playground() {
  const [site, setSite] = useState('vault.example')
  const [path, setPath] = useState('/account/email')
  const [paramKey, setParamKey] = useState('email')
  const [paramValue, setParamValue] = useState('attacker@evil.example')
  const [vector, setVector] = useState<Vector>('form-post')
  const [token, setToken] = useState('')
  const [defense, setDefense] = useState<Defense>(INITIAL_DEFENSE)
  const [result, setResult] = useState<AttackResult | null>(null)

  const scenario: LabScenario = useMemo(
    () => ({
      id: 'playground',
      title: 'Playground target',
      stage: 'beginner',
      category: 'custom',
      mode: 'exploit',
      summary: '',
      takeaway: '',
      victim: { name: 'Victim', site, disclosure: '' },
      action: {
        label: 'Change account data',
        path,
        params: { [paramKey || 'field']: paramValue },
        before: 'original value',
        after: paramValue,
      },
      defense,
      secure: defense,
      objectives: [],
      hints: [],
      walkthrough: [],
    }),
    [site, path, paramKey, paramValue, defense],
  )

  const snippet = useMemo(
    () => attackSnippet(scenario, { vector, token }),
    [scenario, vector, token],
  )

  const set = <K extends DefenseKey>(key: K, value: Defense[K]) =>
    setDefense({ ...defense, [key]: value })

  return (
    <div className="container-page py-10">
      <header className="mb-8 flex flex-col gap-3">
        <Badge tone="accent" className="w-fit">
          <Terminal className="size-3" /> Playground
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Forge playground
        </h1>
        <p className="max-w-2xl text-muted">
          Build your own scenario. Define the target and its defenses, pick a vector, and
          watch the request resolve hop by hop.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Target</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Site" value={site} onChange={setSite} mono />
              <Field label="Endpoint path" value={path} onChange={setPath} mono />
              <Field label="Param name" value={paramKey} onChange={setParamKey} mono />
              <Field label="Param value" value={paramValue} onChange={setParamValue} mono />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Delivery vector</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.keys(VECTORS) as Vector[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVector(v)}
                  className={cn(
                    'rounded-lg border p-2.5 text-left transition',
                    v === vector
                      ? 'border-brand bg-brand-soft'
                      : 'border-line bg-surface-2 hover:border-line-strong',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-ink">{VECTORS[v].label}</span>
                    <Badge tone={VECTORS[v].method === 'POST' ? 'warning' : 'accent'} className="ml-auto">
                      {VECTORS[v].method}
                    </Badge>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3">
              <Field label="Token (optional)" value={token} onChange={setToken} mono />
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold text-ink">Defenses</h2>
            <div className="flex flex-col gap-3.5">
              <SwitchRow label="Require POST" checked={defense.requirePost} onChange={(v) => set('requirePost', v)} />
              <SwitchRow label="Validate Origin / Referer" checked={defense.originCheck} onChange={(v) => set('originCheck', v)} />
              <SwitchRow label="Require custom header" checked={defense.customHeader} onChange={(v) => set('customHeader', v)} />
              <SwitchRow label="Token bound to POST only" checked={defense.tokenMethodBound} onChange={(v) => set('tokenMethodBound', v)} />
              <SwitchRow label="Honour method override" checked={defense.methodOverride} onChange={(v) => set('methodOverride', v)} />
              <SwitchRow label="Client-side redirect gadget" checked={defense.clientRedirect} onChange={(v) => set('clientRedirect', v)} />
              <SwitchRow label="Sibling-domain XSS" checked={defense.siblingXss} onChange={(v) => set('siblingXss', v)} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-ink">CSRF token</span>
                <Segmented
                  aria-label="Token"
                  size="sm"
                  value={defense.token}
                  onChange={(v) => set('token', v)}
                  options={[
                    { value: 'none', label: 'None' },
                    { value: 'presence', label: 'Presence' },
                    { value: 'unbound', label: 'Unbound' },
                    { value: 'bound', label: 'Bound' },
                    { value: 'cookie', label: 'Cookie' },
                  ]}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-ink">Cookie SameSite</span>
                <Segmented
                  aria-label="SameSite"
                  size="sm"
                  value={defense.sameSite}
                  onChange={(v) => set('sameSite', v)}
                  options={[
                    { value: 'none', label: 'None' },
                    { value: 'lax', label: 'Lax' },
                    { value: 'strict', label: 'Strict' },
                  ]}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-ink">Referer validation</span>
                <Segmented
                  aria-label="Referer validation"
                  size="sm"
                  value={defense.refererCheck}
                  onChange={(v) => set('refererCheck', v)}
                  options={[
                    { value: 'off', label: 'Off' },
                    { value: 'if-present', label: 'If present' },
                    { value: 'contains', label: 'Contains' },
                    { value: 'exact', label: 'Exact' },
                  ]}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm text-ink">Cookie injection (CRLF)</span>
                <Segmented
                  aria-label="Cookie injection"
                  size="sm"
                  value={defense.cookieInjection}
                  onChange={(v) => set('cookieInjection', v)}
                  options={[
                    { value: 'none', label: 'None' },
                    { value: 'crlf', label: 'CRLF' },
                    { value: 'refresh', label: 'Refresh' },
                  ]}
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <h2 className="text-sm font-semibold text-ink">Payload</h2>
              <Button
                variant="danger"
                size="sm"
                className="ml-auto"
                onClick={() => setResult(runCsrf(scenario, defense, { vector, token }))}
              >
                <Play className="size-3.5 fill-current" /> Run
              </Button>
            </div>
            <CodeBlock code={snippet} title={`https://${site}`} wrap />
          </Card>

          {result && (
            <div
              className={cn(
                'flex items-start gap-3 rounded-xl border p-4',
                result.pwned ? 'border-danger/40 bg-danger-soft' : 'border-success/40 bg-success-soft',
              )}
            >
              {result.pwned ? (
                <ShieldAlert className="mt-0.5 size-5 shrink-0 text-danger" />
              ) : (
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
              )}
              <div>
                <p className="font-semibold text-ink">
                  {result.pwned ? 'Attack succeeded' : 'Attack blocked'}
                </p>
                <p className="text-sm text-muted">
                  {result.pwned
                    ? `${paramKey} would be changed to "${paramValue}".`
                    : `Stopped by: ${result.blockedBy}`}
                </p>
              </div>
            </div>
          )}

          {result && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-ink">Trace</h2>
              <ol className="flex flex-col gap-3">
                {result.trace.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className={cn(
                        'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border text-[10px] font-bold',
                        s.status === 'ok'
                          ? 'border-success/40 bg-success-soft text-success'
                          : s.status === 'block'
                            ? 'border-danger/40 bg-danger-soft text-danger'
                            : s.status === 'warn'
                              ? 'border-warning/40 bg-warning-soft text-warning'
                              : 'border-line bg-surface-2 text-muted',
                      )}
                    >
                      {s.status === 'ok' ? (
                        <Check className="size-3.5" />
                      ) : s.status === 'block' ? (
                        <ShieldAlert className="size-3.5" />
                      ) : s.status === 'warn' ? (
                        <AlertTriangle className="size-3.5" />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">
                        {s.phase}
                      </p>
                      <p className="text-sm font-medium text-ink">{s.label}</p>
                      <p className="text-sm text-muted">{s.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  mono,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  mono?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-10 rounded-md border border-line bg-surface-2 px-3 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-[var(--brand-ring)]',
          mono && 'font-mono text-[13px]',
        )}
      />
    </label>
  )
}

function SwitchRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-sm text-ink">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} label={label} />
    </div>
  )
}
