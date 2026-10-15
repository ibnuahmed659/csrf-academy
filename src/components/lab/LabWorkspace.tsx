import {
  AlertTriangle,
  Check,
  ChevronDown,
  Cookie,
  Flag,
  Lightbulb,
  Lock,
  Play,
  Send,
  ShieldAlert,
  ShieldCheck,
  Target,
  User,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AttackResult, Defense, DefenseKey, LabScenario, Vector } from '@/lib/lab'
import { VECTORS, attackSnippet, runCsrf } from '@/lib/lab'
import { useProgress } from '@/lib/progress'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { Segmented } from '@/components/ui/Segmented'
import { Switch } from '@/components/ui/Switch'
import { cn } from '@/lib/utils'

const DEFAULT_VECTOR: Record<string, Vector> = {
  'get-image': 'img',
  'samesite-lax': 'link',
  'samesite-strict': 'link',
  'origin-check': 'form-post',
  'method-override': 'form-get',
  'samesite-lax-override': 'link',
  'samesite-strict-redirect': 'link',
}

export function LabWorkspace({ scenario }: { scenario: LabScenario }) {
  const { markLabSolved } = useProgress()
  const [defense, setDefense] = useState<Defense>(scenario.defense)
  const [vector, setVector] = useState<Vector>(
    DEFAULT_VECTOR[scenario.id] ?? 'form-post',
  )
  const [token, setToken] = useState('')
  const [result, setResult] = useState<AttackResult | null>(null)
  const [attempts, setAttempts] = useState<Vector[]>([])
  const [running, setRunning] = useState(false)

  const snippet = useMemo(
    () => attackSnippet(scenario, { vector, token }),
    [scenario, vector, token],
  )

  const changedDefense = useMemo(
    () => JSON.stringify(defense) !== JSON.stringify(scenario.defense),
    [defense, scenario.defense],
  )

  const solved = useMemo(() => {
    if (!result) return false
    if (scenario.mode === 'exploit') return result.pwned
    return attempts.length >= 2 && !result.pwned
  }, [result, attempts.length, scenario.mode])

  const defended = useMemo(
    () => result != null && !result.pwned && changedDefense,
    [result, changedDefense],
  )

  useEffect(() => {
    if (solved) markLabSolved(scenario.id)
  }, [solved, scenario.id, markLabSolved])

  const run = (override?: Defense) => {
    const def = override ?? defense
    setRunning(true)
    const res = runCsrf(scenario, def, { vector, token })
    setAttempts((prev) => (prev.includes(vector) ? prev : [...prev, vector]))
    window.setTimeout(() => {
      setResult(res)
      setRunning(false)
    }, 420)
  }

  const applyRecommended = () => {
    setDefense(scenario.secure)
    run(scenario.secure)
  }

  const resetLab = () => {
    setDefense(scenario.defense)
    setResult(null)
    setAttempts([])
    setToken('')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <ForgeCard
          scenario={scenario}
          vector={vector}
          onVector={setVector}
          token={token}
          onToken={setToken}
          snippet={snippet}
          running={running}
          canRun={!running}
          onRun={() => run()}
          onReset={resetLab}
        />

        <TargetCard scenario={scenario} result={result} />

        {result && <ResultBanner scenario={scenario} result={result} />}

        <TraceCard result={result} running={running} />

        <DefenseCard
          scenario={scenario}
          defense={defense}
          setDefense={setDefense}
          changed={changedDefense}
          defended={defended}
          onApplyRecommended={applyRecommended}
          onRunDefense={() => run()}
          running={running}
        />

        <WalkthroughCard scenario={scenario} />
      </div>

      <aside className="flex flex-col gap-5 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto lg:pb-4">
        <VictimCard scenario={scenario} />
        <ObjectivesCard scenario={scenario} solved={solved} attempts={attempts} />
        <HintsCard scenario={scenario} />
      </aside>
    </div>
  )
}

function SectionCard({
  title,
  icon,
  action,
  children,
}: {
  title: string
  icon?: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        {icon && <span className="text-brand">{icon}</span>}
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        <div className="ml-auto">{action}</div>
      </div>
      <div className="p-4">{children}</div>
    </Card>
  )
}

function ForgeCard({
  scenario,
  vector,
  onVector,
  token,
  onToken,
  snippet,
  running,
  canRun,
  onRun,
  onReset,
}: {
  scenario: LabScenario
  vector: Vector
  onVector: (v: Vector) => void
  token: string
  onToken: (v: string) => void
  snippet: string
  running: boolean
  canRun: boolean
  onRun: () => void
  onReset: () => void
}) {
  const spec = VECTORS[vector]
  return (
    <SectionCard
      title="Forge the request"
      icon={<Send className="size-4" />}
      action={
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-faint">
            Delivery vector
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(VECTORS) as Vector[]).map((v) => {
              const vs = VECTORS[v]
              const active = v === vector
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => onVector(v)}
                  className={cn(
                    'flex flex-col gap-1 rounded-lg border p-2.5 text-left transition',
                    active
                      ? 'border-brand bg-brand-soft'
                      : 'border-line bg-surface-2 hover:border-line-strong',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-ink">{vs.label}</span>
                    <Badge tone={vs.method === 'POST' ? 'warning' : 'accent'} className="ml-auto">
                      {vs.method}
                    </Badge>
                  </span>
                  <span className="text-[11px] leading-snug text-muted">{vs.blurb}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label
            htmlFor="tok"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-faint"
          >
            CSRF token (optional)
          </label>
          <input
            id="tok"
            value={token}
            onChange={(e) => onToken(e.target.value)}
            placeholder="paste a token the endpoint might accept…"
            className="h-10 w-full rounded-md border border-line bg-surface-2 px-3 font-mono text-[13px] text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-[var(--brand-ring)]"
          />
          {scenario.leakedToken && scenario.sessionToken && (
            <p className="mt-1.5 text-[11px] text-muted">
              Leaked token seen in the victim’s URL:{' '}
              <button
                type="button"
                className="font-mono text-brand hover:underline"
                onClick={() => onToken(scenario.sessionToken!)}
              >
                {scenario.sessionToken}
              </button>
            </p>
          )}
        </div>

        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-faint">
              Attacker’s page code
            </span>
            <Badge tone="danger" className="ml-auto">
              {spec.kind}
            </Badge>
          </div>
          <CodeBlock code={snippet} title="evil.example" wrap />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="danger" size="lg" loading={running} disabled={!canRun} onClick={onRun}>
            {!running && <Play className="size-4 fill-current" />}
            Run attack
          </Button>
          <p className="text-[12px] text-muted">
            {spec.auto ? 'Fires automatically.' : 'Requires the victim to click.'}
          </p>
        </div>
      </div>
    </SectionCard>
  )
}

function TargetCard({
  scenario,
  result,
}: {
  scenario: LabScenario
  result: AttackResult | null
}) {
  const pwned = result?.pwned ?? false
  return (
    <SectionCard title="Target state" icon={<Target className="size-4" />}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-ink">{scenario.action.label}</span>
          <span className="font-mono text-[11px] text-faint">{scenario.action.path}</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-surface-2 p-3">
            <p className="text-[11px] uppercase tracking-wide text-faint">Before</p>
            <p className="mt-1 font-mono text-[13px] text-muted">{scenario.action.before}</p>
          </div>
          <div
            className={cn(
              'relative overflow-hidden rounded-lg border p-3 transition',
              pwned ? 'border-danger/40 bg-danger-soft' : 'border-line bg-surface-2',
            )}
          >
            {pwned && <span className="flash-impact absolute inset-0 bg-danger/20" />}
            <p className="text-[11px] uppercase tracking-wide text-faint">After</p>
            <p
              className={cn(
                'mt-1 font-mono text-[13px]',
                pwned ? 'font-semibold text-danger' : 'text-muted',
              )}
            >
              {pwned ? scenario.action.after : scenario.action.before}
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

function ResultBanner({
  scenario,
  result,
}: {
  scenario: LabScenario
  result: AttackResult
}) {
  if (result.pwned) {
    return (
      <div className="scene-in flex items-start gap-3 rounded-xl border border-danger/40 bg-danger-soft p-4">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-danger" />
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-ink">Attack succeeded</p>
          <p className="text-sm text-muted">
            The forged request changed state on {scenario.victim.name}’s account. In a
            real app, {scenario.action.label.toLowerCase()} just became the attacker’s.
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="scene-in flex items-start gap-3 rounded-xl border border-success/40 bg-success-soft p-4">
      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-ink">Attack blocked</p>
        <p className="text-sm text-muted">
          Stopped by: <span className="font-medium text-ink">{result.blockedBy}</span>. The
          victim’s account is untouched.
        </p>
      </div>
    </div>
  )
}

const statusStyle: Record<string, string> = {
  ok: 'border-success/40 bg-success-soft text-success',
  block: 'border-danger/40 bg-danger-soft text-danger',
  warn: 'border-warning/40 bg-warning-soft text-warning',
  info: 'border-line bg-surface-2 text-muted',
}

function TraceCard({ result, running }: { result: AttackResult | null; running: boolean }) {
  return (
    <SectionCard title="What actually happened" icon={<Flag className="size-4" />}>
      {!result && !running && (
        <p className="text-sm text-muted">
          Run an attack to trace every hop: the lure, the cookie decision, the server’s
          validation, and the impact.
        </p>
      )}
      {running && <p className="animate-pulse text-sm text-muted">Tracing the request…</p>}
      {result && (
        <ol className="flex flex-col gap-0">
          {result.trace.map((s, i) => (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full border text-[11px] font-bold',
                    statusStyle[s.status],
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
                {i < result.trace.length - 1 && <span className="my-0.5 w-px flex-1 bg-line" />}
              </div>
              <div className="pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">
                    {s.phase}
                  </span>
                  <span className="text-sm font-semibold text-ink">{s.label}</span>
                </div>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  )
}

function DefenseCard({
  scenario,
  defense,
  setDefense,
  changed,
  defended,
  onApplyRecommended,
  onRunDefense,
  running,
}: {
  scenario: LabScenario
  defense: Defense
  setDefense: (d: Defense) => void
  changed: boolean
  defended: boolean
  onApplyRecommended: () => void
  onRunDefense: () => void
  running: boolean
}) {
  const set = <K extends DefenseKey>(key: K, value: Defense[K]) =>
    setDefense({ ...defense, [key]: value })

  return (
    <SectionCard
      title="Defense panel"
      icon={<Lock className="size-4" />}
      action={
        defended ? (
          <Badge tone="success">
            <Check className="size-3" /> Defended
          </Badge>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          You are the defender now. Change the controls, then re-run the same attack. Make
          it fail.
        </p>

        <DefenseRow
          label="Require POST"
          hint="Reject GET on this endpoint"
          checked={defense.requirePost}
          onChange={(v) => set('requirePost', v)}
        />
        <DefenseRow
          label="Validate Origin / Referer"
          hint="Drop requests from other origins"
          checked={defense.originCheck}
          onChange={(v) => set('originCheck', v)}
        />
        <DefenseRow
          label="Require custom header"
          hint="Forces a CORS preflight"
          checked={defense.customHeader}
          onChange={(v) => set('customHeader', v)}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">CSRF token</p>
            <p className="text-[12px] text-muted">How the token is validated</p>
          </div>
          <Segmented
            aria-label="Token validation"
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
          <div>
            <p className="text-sm font-medium text-ink">Cookie SameSite</p>
            <p className="text-[12px] text-muted">When the cookie crosses sites</p>
          </div>
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
          <div>
            <p className="text-sm font-medium text-ink">Referer validation</p>
            <p className="text-[12px] text-muted">How strictly the Referer is checked</p>
          </div>
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
          <div>
            <p className="text-sm font-medium text-ink">Cookie injection (CRLF)</p>
            <p className="text-[12px] text-muted">Can a reflected endpoint plant cookies?</p>
          </div>
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

        <DefenseRow
          label="Token bound to POST only"
          hint="A GET slips past the token check"
          checked={defense.tokenMethodBound}
          onChange={(v) => set('tokenMethodBound', v)}
        />
        <DefenseRow
          label="Honour method override"
          hint="Treats _method=POST / GET as a real POST"
          checked={defense.methodOverride}
          onChange={(v) => set('methodOverride', v)}
        />
        <DefenseRow
          label="Client-side redirect gadget"
          hint="A same-site bounce the attacker can steer"
          checked={defense.clientRedirect}
          onChange={(v) => set('clientRedirect', v)}
        />
        <DefenseRow
          label="Sibling-domain XSS"
          hint="Attacker code on a same-site host (CSWSH)"
          checked={defense.siblingXss}
          onChange={(v) => set('siblingXss', v)}
        />

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <Button variant="secondary" onClick={onApplyRecommended} disabled={running}>
            Apply recommended defenses
          </Button>
          <Button variant="primary" loading={running} onClick={onRunDefense}>
            Re-run attack
          </Button>
          {changed && (
            <span className="text-[12px] text-faint">Configuration changed</span>
          )}
        </div>

        {defended && (
          <p className="rounded-lg border border-success/40 bg-success-soft p-3 text-sm text-muted">
            The same forged request is now rejected. For this scenario the target’s
            recommended posture is:{' '}
            <span className="font-medium text-ink">
              {describeDefense(scenario.secure)}
            </span>
            .
          </p>
        )}
      </div>
    </SectionCard>
  )
}

function DefenseRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-[12px] text-muted">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} label={label} />
    </div>
  )
}

function describeDefense(d: Defense): string {
  const parts: string[] = []
  if (d.requirePost) parts.push('POST-only')
  if (d.token === 'bound') parts.push('session-bound token')
  else if (d.token === 'presence') parts.push('token only if present')
  else if (d.token === 'unbound') parts.push('unbound token')
  else if (d.token === 'cookie') parts.push('cookie-bound token')
  if (d.tokenMethodBound) parts.push('token on POST only')
  if (d.originCheck) parts.push('Origin check')
  if (d.refererCheck === 'exact') parts.push('Referer exact match')
  else if (d.refererCheck === 'if-present') parts.push('Referer if present')
  else if (d.refererCheck === 'contains') parts.push('Referer contains')
  if (d.customHeader) parts.push('required header')
  if (d.methodOverride) parts.push('method override open')
  if (d.cookieInjection === 'crlf') parts.push('reflected CRLF')
  else if (d.cookieInjection === 'refresh') parts.push('refreshable Lax')
  if (d.clientRedirect) parts.push('client-side redirect gadget')
  if (d.siblingXss) parts.push('sibling-domain XSS')
  parts.push(`SameSite=${d.sameSite}`)
  return parts.join(' · ')
}

function VictimCard({ scenario }: { scenario: LabScenario }) {
  return (
    <SectionCard title="The victim" icon={<User className="size-4" />}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-sky-400/30 to-sky-600/20 text-sm font-bold text-sky-200">
            {scenario.victim.name[0]}
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{scenario.victim.name}</p>
            <p className="font-mono text-[11px] text-faint">{scenario.victim.site}</p>
          </div>
        </div>
        <p className="text-sm text-muted">{scenario.victim.disclosure}</p>
        <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[12px] text-muted">
          <Cookie className="size-3.5 text-warning" />
          session cookie auto-attached
        </div>
      </div>
    </SectionCard>
  )
}

function ObjectivesCard({
  scenario,
  solved,
  attempts,
}: {
  scenario: LabScenario
  solved: boolean
  attempts: Vector[]
}) {
  return (
    <SectionCard
      title="Objectives"
      icon={<Target className="size-4" />}
      action={
        solved ? (
          <Badge tone="success">
            <Check className="size-3" /> Solved
          </Badge>
        ) : (
          <Badge tone="neutral">
            {scenario.mode === 'exploit' ? 'Exploit' : 'Assess'}
          </Badge>
        )
      }
    >
      <ul className="flex flex-col gap-2.5">
        {scenario.objectives.map((o, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-muted">
            <span className="mt-0.5 grid size-[1.125rem] shrink-0 place-items-center rounded-full border border-line-strong text-[10px] text-faint">
              {i + 1}
            </span>
            {o}
          </li>
        ))}
      </ul>
      {scenario.mode === 'assess' && (
        <div className="mt-3 border-t border-line pt-3 text-[12px] text-muted">
          Vectors tried:{' '}
          <span className="font-medium text-ink">{attempts.length}</span> / need 2 blocked
        </div>
      )}
    </SectionCard>
  )
}

function HintsCard({ scenario }: { scenario: LabScenario }) {
  const [open, setOpen] = useState(false)
  return (
    <SectionCard title="Hints" icon={<Lightbulb className="size-4" />}>
      {!open ? (
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          Reveal hints
        </Button>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {scenario.hints.map((h, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-muted">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" />
              {h}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}

function WalkthroughCard({ scenario }: { scenario: LabScenario }) {
  const [open, setOpen] = useState(false)
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <span className="text-brand">
          <Flag className="size-4" />
        </span>
        <span className="text-sm font-semibold text-ink">Guided walkthrough</span>
        <ChevronDown
          className={cn('ml-auto size-4 text-muted transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-4 border-t border-line p-4">
          {scenario.walkthrough.map((w, i) => (
            <div key={i} className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-ink">{w.title}</p>
              <p className="text-sm leading-relaxed text-muted">{w.body}</p>
            </div>
          ))}
          <div className="rounded-lg border border-brand/30 bg-brand-soft p-3">
            <p className="text-sm font-semibold text-ink">Takeaway</p>
            <p className="mt-1 text-sm text-muted">{scenario.takeaway}</p>
          </div>
        </div>
      )}
    </Card>
  )
}
