import {
  AlertTriangle,
  ArrowRight,
  Ban,
  Bug,
  Check,
  ClipboardCopy,
  Cookie,
  Eye,
  Flag,
  Gift,
  Globe,
  Info,
  Lightbulb,
  Lock,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Target,
  Trophy,
  User,
  Wrench,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { AttackResult, Defense, LabScenario, TraceStatus, Vector } from '@/lib/lab'
import { runCsrf, VECTORS } from '@/lib/lab'
import { useProgress } from '@/lib/progress'
import { BrowserChrome } from './BrowserChrome'
import { ProxyPanel, type Exchange } from './ProxyPanel'
import { type Finding, type HttpHeader, type HttpRequest, type HttpResponse } from './HttpInspector'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { Switch } from '@/components/ui/Switch'
import { cn } from '@/lib/utils'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'
const ATTACKER_ORIGIN = 'https://evil.example'
const ATTACKER_PAGE = `${ATTACKER_ORIGIN}/win-a-prize`
const SESSION_COOKIE = 'eyJ1IjoiYW1pbmEifQ.9f31c7a4e0a2b8d3c5e7'

type StepId = 'brief' | 'recon' | 'craft' | 'fire' | 'impact' | 'defend' | 'recap'

const STEPS: { id: StepId; label: string; icon: typeof Target }[] = [
  { id: 'brief', label: 'Briefing', icon: Target },
  { id: 'recon', label: 'Recon', icon: Eye },
  { id: 'craft', label: 'Craft lure', icon: Bug },
  { id: 'fire', label: 'Fire', icon: Send },
  { id: 'impact', label: 'Impact', icon: ShieldAlert },
  { id: 'defend', label: 'Defend', icon: ShieldCheck },
  { id: 'recap', label: 'Recap', icon: Lightbulb },
]

export function InteractiveLab({ scenario }: { scenario: LabScenario }) {
  const { markLabSolved } = useProgress()
  const isAssess = scenario.mode === 'assess'
  const ACCOUNT_URL = `https://${scenario.victim.site}/account`

  const [step, setStep] = useState(0)
  const [maxStep, setMaxStep] = useState(0)

  // simulated browser
  const [victimUrl, setVictimUrl] = useState(ACCOUNT_URL)
  const [navStack, setNavStack] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  // victim state (the setting the action changes)
  const [state, setState] = useState(scenario.action.before)
  const [toast, setToast] = useState<string | null>(null)

  // attacker payload
  const [payload, setPayload] = useState<{ vector: Vector; token: string }>({
    vector: scenario.id === 'get-image' ? 'img' : 'form-post',
    token: '',
  })
  const [deployed, setDeployed] = useState(false)

  // proxy + engine
  const [history, setHistory] = useState<Exchange[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const nextId = useRef(1)
  const [lastResult, setLastResult] = useState<AttackResult | null>(null)

  const [defense, setDefense] = useState<Defense>(scenario.defense)
  const [pwnedOnce, setPwnedOnce] = useState(false)
  const [defendedOnce, setDefendedOnce] = useState(false)

  const compromised = state === scenario.action.after
  const onLure = victimUrl.includes('evil.example')
  const solved = (isAssess || pwnedOnce) && defendedOnce

  useEffect(() => {
    if (solved) markLabSolved(scenario.id)
  }, [solved, markLabSolved, scenario.id])

  // Capture the initial same-origin page load in the proxy.
  useEffect(() => {
    const ex = legitGet(scenario, nextId.current++)
    setHistory((h) => [...h, ex])
    setSelectedId(ex.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goto = (i: number) => {
    setStep(i)
    setMaxStep((m) => Math.max(m, i))
  }

  const flash = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2600)
  }

  /* ---------------- engine ---------------- */
  const navigate = (raw: string, opts?: { forge?: boolean }) => {
    const norm = normalize(raw, ACCOUNT_URL)
    setNavStack((s) => [...s, victimUrl])
    setVictimUrl(norm)
    if (norm === ACCOUNT_URL) {
      const ex = legitGet(scenario, nextId.current++)
      setHistory((h) => [...h, ex])
      setSelectedId(ex.id)
    }
    if (norm === ATTACKER_PAGE && opts?.forge !== false) scheduleForge()
  }

  const goBack = () => {
    setNavStack((s) => {
      if (s.length === 0) return s
      const prev = s[s.length - 1]
      setVictimUrl(prev)
      return s.slice(0, -1)
    })
  }

  const scheduleForge = () => {
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      const ex = makeForged()
      setHistory((h) => [...h, ex])
      setSelectedId(ex.id)
    }, 650)
  }

  const makeForged = (): Exchange => {
    const id = nextId.current++
    const request = forgedRequest(scenario, defense, payload.vector, payload.token)
    const attached = cookieAttached(defense, payload.vector)
    const findings = forgedFindings(defense, payload.vector, attached)
    return { id, kind: 'forged', request, response: null, findings, pending: true }
  }

  const evaluate = (): AttackResult => runCsrf(scenario, defense, { vector: payload.vector, token: payload.token })

  const completeExchange = (ex: Exchange, res: AttackResult) => {
    const response = res.pwned ? successResponse(scenario) : blockedResponse(res.blockedBy)
    const attached = cookieAttached(defense, payload.vector)
    const findings = forgedFindings(defense, payload.vector, attached)
    const done: Exchange = { ...ex, response, findings, pending: false, pwned: res.pwned, blockedBy: res.blockedBy }
    setHistory((h) => h.map((x) => (x.id === ex.id ? done : x)))
    setSelectedId(ex.id)
    setLastResult(res)
    if (res.pwned) {
      setState(scenario.action.after)
      setPwnedOnce(true)
    } else {
      setDefendedOnce(true)
    }
  }

  const forwardPending = () => {
    const ex = history.find((h) => h.id === selectedId && h.pending)
    if (!ex) return
    completeExchange(ex, evaluate())
  }

  const dropPending = () => setHistory((h) => h.filter((x) => !(x.id === selectedId && x.pending)))

  const retest = () => {
    setState(scenario.action.before)
    setLastResult(null)
    setNavStack((s) => [...s, victimUrl])
    setVictimUrl(ATTACKER_PAGE)
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      const ex = makeForged()
      setHistory((h) => [...h, ex])
      setSelectedId(ex.id)
      completeExchange(ex, evaluate())
    }, 500)
  }

  /* ---------------- user actions ---------------- */
  const sendLure = () => {
    if (!deployed) return
    setNavStack((s) => [...s, victimUrl])
    setVictimUrl(ATTACKER_PAGE)
    goto(3)
    scheduleForge()
  }

  const restore = () => {
    setState(scenario.action.before)
    setLastResult(null)
    flash('Account restored.')
  }

  const setDef = <K extends keyof Defense>(key: K, value: Defense[K]) => setDefense((d) => ({ ...d, [key]: value }))

  const current = STEPS[step].id
  const bookmarks = [
    { label: `Account · ${scenario.victim.site}`, url: ACCOUNT_URL },
    { label: 'Lure · evil.example', url: ATTACKER_PAGE },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Stepper steps={STEPS} active={step} maxReached={maxStep} onSelect={goto} locked={{ impact: !lastResult }} />

      <div className="flex min-w-0 flex-col gap-6">
        {/* ---------------- Briefing ---------------- */}
        {current === 'brief' && (
          <Card className="p-6">
            <StepHeader kicker="Mission brief" title={scenario.title}>
              {scenario.summary} You are the attacker: operate the tools below to make{' '}
              {scenario.victim.name}’s browser perform <em>{scenario.action.label.toLowerCase()}</em> against
              their own account.
            </StepHeader>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <InfoTile icon={<Cookie className="size-4" />} title="The trust">
                Every request {scenario.victim.name}’s browser sends carries their{' '}
                <span className="font-mono">session</span> cookie automatically. The server treats “has a
                valid cookie” as “this is {scenario.victim.name}”.
              </InfoTile>
              <InfoTile icon={<Bug className="size-4" />} title="The gap">
                The <span className="font-mono">{scenario.action.path}</span> endpoint has no extra proof
                that {scenario.victim.name} meant to send it.
              </InfoTile>
              <InfoTile icon={<Target className="size-4" />} title="Your goal">
                Make the account read <span className="font-mono text-danger">{scenario.action.after}</span>
                .
              </InfoTile>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <Button variant="forge" onClick={() => goto(1)}>
                Start — recon the request <ArrowRight className="size-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* ---------------- Recon ---------------- */}
        {current === 'recon' && (
          <Card className="p-6">
            <StepHeader kicker="Step 1 — reconnaissance" title="Watch a real request hit the proxy">
              {scenario.victim.name} is signed in to{' '}
              <span className="font-mono">{scenario.victim.site}</span>. The browser has already loaded
              their account page — the proxy captured the request. Use the address bar, bookmarks, and
              back button to browse; inspect what the browser sends.
            </StepHeader>

            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
              <BrowserChrome
                kind="victim"
                url={victimUrl}
                tabTitle={`Account · ${scenario.victim.site}`}
                onNavigate={(u) => navigate(u, { forge: false })}
                onBack={goBack}
                canGoBack={navStack.length > 0}
                bookmarks={bookmarks}
                identity={<IdentityChip name={scenario.victim.name} />}
              >
                <VictimApp scenario={scenario} state={state} toast={toast} />
              </BrowserChrome>

              <ProxyPanel exchanges={history} selectedId={selectedId} onSelect={setSelectedId} title="HTTP history" />
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-lg border border-brand/30 bg-brand-soft p-4">
              <Info className="mt-0.5 size-4 shrink-0 text-brand" />
              <p className="text-sm leading-relaxed text-muted">
                The only thing identifying the user is the <span className="font-mono">Cookie</span> header.
                Check the <span className="font-semibold text-ink">Findings</span> tab to see which defenses
                are missing on the state-changing endpoint.
              </p>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <Button variant="forge" onClick={() => goto(2)}>
                Craft the lure <ArrowRight className="size-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* ---------------- Craft lure ---------------- */}
        {current === 'craft' && (
          <Card className="p-6">
            <StepHeader kicker="Step 2 — craft the lure" title={`Build a page on ${ATTACKER_ORIGIN}`}>
              Choose how the forged request is triggered. It targets{' '}
              <span className="font-mono">
                {scenario.action.label} → {scenario.action.path}
              </span>
              . Deploy it, then open it in {scenario.victim.name}’s browser.
            </StepHeader>

            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
              <PayloadPanel scenario={scenario} payload={payload} setPayload={setPayload} />

              <div className="flex min-w-0 flex-col gap-3">
                <BrowserChrome kind="attacker" url={ATTACKER_PAGE} tabTitle="You’ve won an iPhone!" trusted={false}>
                  <AttackerLure />
                </BrowserChrome>
                <Collapse title="Why the browser allows this" icon={<Info className="size-4" />}>
                  A page may always <span className="font-medium text-ink">send</span> a request to any
                  other site. It cannot <span className="font-medium text-ink">read</span> the response
                  (CORS), but the request still goes out — and carries cookies per the cookie’s{' '}
                  <span className="font-mono">SameSite</span> attribute.
                </Collapse>
              </div>
            </div>

            <div className="mt-5">
              <Hints hints={scenario.hints} />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button variant="secondary" onClick={() => setDeployed(true)}>
                <Wrench className="size-4" /> Deploy to evil.example
              </Button>
              <Button variant="forge" onClick={sendLure} disabled={!deployed}>
                <Send className="size-4" /> Open it in {scenario.victim.name}’s browser
              </Button>
              {deployed && (
                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-success">
                  <Check className="size-3.5" /> Deployed.
                </span>
              )}
            </div>
          </Card>
        )}

        {/* ---------------- Fire ---------------- */}
        {current === 'fire' && (
          <Card className="p-6">
            <StepHeader kicker="Step 3 — execution" title={`${scenario.victim.name} opens the lure; you forward the request`}>
              The browser auto-submits the hidden request to Vault. The proxy intercepts it — review the
              flagged headers, then <strong>Forward</strong> it to the server.
            </StepHeader>

            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
              <BrowserChrome
                kind="victim"
                url={victimUrl}
                tabTitle={onLure ? 'You’ve won an iPhone!' : `Account · ${scenario.victim.site}`}
                trusted={!onLure}
                onNavigate={(u) => navigate(u)}
                onBack={goBack}
                canGoBack={navStack.length > 0}
                bookmarks={bookmarks}
                identity={<IdentityChip name={scenario.victim.name} />}
              >
                {onLure ? <AttackerLure submitting={submitting} /> : <VictimApp scenario={scenario} state={state} />}
              </BrowserChrome>

              <ProxyPanel
                exchanges={history}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onForward={forwardPending}
                onDrop={dropPending}
                title="Intercepting proxy"
              />
            </div>

            {lastResult && (
              <div className="scene-in mt-5">
                <TraceList result={lastResult} />
                {lastResult.pwned ? (
                  <Banner tone="danger" icon={<ShieldAlert className="size-5" />} title="The request succeeded">
                    The server processed it as {scenario.victim.name} and applied the change.
                  </Banner>
                ) : (
                  <Banner tone="success" icon={<ShieldCheck className="size-5" />} title="The request was rejected">
                    Stopped by <span className="font-medium text-ink">{lastResult.blockedBy}</span>. The
                    account is untouched.
                  </Banner>
                )}
              </div>
            )}

            <div className="mt-5 flex items-center gap-3">
              <Button
                variant="forge"
                onClick={() => {
                  setVictimUrl(ACCOUNT_URL)
                  goto(4)
                }}
                disabled={!lastResult}
              >
                {isAssess ? 'Review the result' : 'See the impact'} <ArrowRight className="size-4" />
              </Button>
              {!lastResult && <span className="text-[12.5px] text-muted">Forward the intercepted request to continue.</span>}
            </div>
          </Card>
        )}

        {/* ---------------- Impact ---------------- */}
        {current === 'impact' && (
          <Card className="p-6">
            <StepHeader
              kicker="Step 4 — impact"
              title={isAssess ? 'The defense held' : `${scenario.victim.name}’s account, without ${scenario.victim.name}`}
            >
              {isAssess
                ? 'Every vector was rejected. Confirm the state never changed and identify which defense stopped it.'
                : 'Open the account page: the change is live in their real session — a valid action, authorized by a cookie, performed against their will.'}
            </StepHeader>

            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
              <BrowserChrome
                kind="victim"
                url={victimUrl}
                tabTitle={`Account · ${scenario.victim.site}`}
                onNavigate={(u) => navigate(u, { forge: false })}
                onBack={goBack}
                canGoBack={navStack.length > 0}
                bookmarks={bookmarks}
                identity={<IdentityChip name={scenario.victim.name} />}
              >
                <VictimApp scenario={scenario} state={state} toast={toast} compromised={compromised} />
              </BrowserChrome>

              <div className="flex min-w-0 flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <StateBox label="Before" value={scenario.action.before} />
                  <StateBox label="After" value={compromised ? scenario.action.after : scenario.action.before} danger={compromised} />
                </div>
                <ProxyPanel exchanges={history} selectedId={selectedId} onSelect={setSelectedId} title="HTTP history" />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <Button variant="forge" onClick={() => goto(5)}>
                {isAssess ? 'Explore the defenses' : 'Now defend it'} <ShieldCheck className="size-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* ---------------- Defend ---------------- */}
        {current === 'defend' && (
          <Card className="p-6">
            <StepHeader kicker="Step 5 — defend & retest" title="Harden the endpoint, then attack it again">
              Flip the defenses and re-run the exact same forged request. A good fix makes the attack fail{' '}
              <em>without</em> relying on the attacker playing nice.
            </StepHeader>

            <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
              <div className="flex min-w-0 flex-col gap-4">
                <BrowserChrome
                  kind="victim"
                  url={victimUrl}
                  tabTitle={onLure ? 'You’ve won an iPhone!' : `Account · ${scenario.victim.site}`}
                  trusted={!onLure}
                  onNavigate={(u) => navigate(u)}
                  onBack={goBack}
                  canGoBack={navStack.length > 0}
                  bookmarks={bookmarks}
                  identity={<IdentityChip name={scenario.victim.name} />}
                >
                  {onLure ? (
                    <AttackerLure submitting={submitting} />
                  ) : (
                    <VictimApp scenario={scenario} state={state} toast={toast} compromised={compromised} onRestore={restore} />
                  )}
                </BrowserChrome>

                <DefensePanel defense={defense} setDef={setDef} onApplySecure={() => setDefense(scenario.secure)} onResetVuln={() => setDefense(scenario.defense)} />
              </div>

              <div className="flex min-w-0 flex-col gap-4">
                <ProxyPanel
                  exchanges={history}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onForward={forwardPending}
                  onDrop={dropPending}
                  title="Retest"
                  toolbar={
                    <Button variant="danger" size="sm" onClick={retest}>
                      <Send className="size-3.5" /> Re-run the attack
                    </Button>
                  }
                />
                {lastResult && (
                  <div className="scene-in flex flex-col gap-3">
                    {lastResult.pwned ? (
                      <Banner tone="danger" icon={<ShieldAlert className="size-5" />} title="Still vulnerable">
                        The request landed. Turn on more defenses and try again.
                      </Banner>
                    ) : (
                      <Banner tone="success" icon={<ShieldCheck className="size-5" />} title="Attack blocked">
                        Stopped by <span className="font-medium text-ink">{lastResult.blockedBy}</span>.
                      </Banner>
                    )}
                    <TraceList result={lastResult} />
                  </div>
                )}
              </div>
            </div>

            {defendedOnce && (
              <div className="mt-5 flex items-center justify-between gap-4 rounded-lg border border-success/40 bg-success-soft p-4">
                <p className="text-sm text-muted">
                  <span className="font-semibold text-ink">Defended.</span> The forged request is now rejected
                  before it can change anything.
                </p>
                <Button variant="success" onClick={() => goto(6)}>
                  Recap & quiz <ArrowRight className="size-4" />
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* ---------------- Recap ---------------- */}
        {current === 'recap' && <RecapStep scenario={scenario} solved={solved} />}
      </div>

      {current !== 'recap' && (
        <aside className="flex flex-col gap-5 lg:sticky lg:top-20 lg:self-start">
          <CaseFile scenario={scenario} pwned={pwnedOnce} defended={defendedOnce} fired={lastResult != null} />
          <PostureCard defense={defense} />
        </aside>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Stepper / header / tiles
 * ------------------------------------------------------------------ */
function Stepper({
  steps,
  active,
  maxReached,
  onSelect,
  locked,
}: {
  steps: { id: StepId; label: string; icon: typeof Target }[]
  active: number
  maxReached: number
  onSelect: (i: number) => void
  locked: Record<string, boolean>
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {steps.map((s, i) => {
        const Icon = s.icon
        const isActive = i === active
        const done = i < maxReached
        const isLocked = locked[s.id]
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => !isLocked && onSelect(i)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition',
              isActive ? 'border-brand bg-brand-soft text-brand' : done ? 'border-line bg-surface-2 text-ink hover:border-line-strong' : 'border-line bg-surface-2 text-muted hover:border-line-strong',
              isLocked && 'cursor-not-allowed opacity-50',
            )}
          >
            <span className={cn('grid size-5 place-items-center rounded-full text-[10px]', isActive ? 'bg-brand text-brand-fg' : done ? 'bg-success/20 text-success' : 'bg-surface-3 text-faint')}>
              {done && !isActive ? <Check className="size-3" /> : <Icon className="size-3" />}
            </span>
            {s.label}
          </button>
        )
      })}
    </div>
  )
}

function StepHeader({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">{kicker}</span>
      <h2 className="text-xl font-bold tracking-tight text-ink">{title}</h2>
      {children && <p className="max-w-2xl text-sm leading-relaxed text-muted">{children}</p>}
    </div>
  )
}

function InfoTile({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-surface-2 p-4">
      <div className="flex items-center gap-2 text-brand">
        {icon}
        <p className="text-[13px] font-semibold text-ink">{title}</p>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{children}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Victim app page (generic)
 * ------------------------------------------------------------------ */
function VictimApp({
  scenario,
  state,
  toast,
  compromised,
  onRestore,
}: {
  scenario: LabScenario
  state: string
  toast?: string | null
  compromised?: boolean
  onRestore?: () => void
}) {
  const initial = scenario.victim.name[0].toUpperCase()
  return (
    <div className="p-5">
      <div className="mx-auto max-w-md">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-accent-soft text-sm font-black text-accent">{initial}</span>
          <div>
            <p className="text-sm font-bold text-ink">{scenario.victim.site}</p>
            <p className="text-[11px] text-faint">Account settings</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
            <span className="size-1.5 rounded-full bg-success" /> signed in
          </span>
        </div>

        {compromised && (
          <div className="scene-in mt-4 flex items-start gap-2.5 rounded-lg border border-danger/40 bg-danger-soft p-3">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-danger" />
            <p className="text-[13px] text-muted">
              <span className="font-semibold text-ink">{scenario.action.label}</span> was applied:{' '}
              <span className="font-mono text-danger">{state}</span>. You did not do this.
            </p>
          </div>
        )}

        <div className="mt-4 rounded-lg border border-line bg-surface-2 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">{scenario.action.label}</p>
          <p className={cn('mt-1.5 font-mono text-[13px]', compromised ? 'font-semibold text-danger' : 'text-ink')}>{state}</p>
        </div>

        {scenario.leakedToken && scenario.sessionToken && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning-soft p-3">
            <Globe className="mt-0.5 size-4 shrink-0 text-warning" />
            <p className="text-[12px] leading-relaxed text-muted">
              Leaked in the page URL: <span className="font-mono text-ink">{scenario.sessionToken}</span>
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {onRestore && (
            <Button type="button" variant="ghost" size="sm" onClick={onRestore}>
              <RotateCcw className="size-3.5" /> Restore
            </Button>
          )}
          {toast && (
            <span className="inline-flex items-center gap-1.5 text-[12px] text-success">
              <Check className="size-3.5" /> {toast}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Payload panel (craft)
 * ------------------------------------------------------------------ */
function PayloadPanel({
  scenario,
  payload,
  setPayload,
}: {
  scenario: LabScenario
  payload: { vector: Vector; token: string }
  setPayload: (p: { vector: Vector; token: string }) => void
}) {
  const target = `https://${scenario.victim.site}${scenario.action.path}`
  const params: Record<string, string> = { ...scenario.action.params }
  if (payload.token.trim()) params.csrf_token = payload.token.trim()
  const source = VECTORS[payload.vector].snippet(target, params)
  const vectors = Object.keys(VECTORS) as Vector[]
  const showToken = scenario.defense.token !== 'none'
  const leaked = scenario.leakedToken && scenario.sessionToken

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-faint">1 · Trigger vector</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {vectors.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setPayload({ ...payload, vector: v })}
              className={cn(
                'rounded-md border px-2.5 py-1.5 text-[12px] font-medium transition',
                payload.vector === v ? 'border-danger bg-danger-soft text-danger' : 'border-line bg-surface-2 text-muted hover:border-line-strong hover:text-ink',
              )}
            >
              {VECTORS[v].label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-muted">{VECTORS[payload.vector].blurb}</p>

        {showToken && (
          <>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-faint">2 · CSRF token</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={payload.token}
                onChange={(e) => setPayload({ ...payload, token: e.target.value })}
                placeholder={leaked ? String(scenario.sessionToken) : scenario.defense.token === 'unbound' ? 'type any token value' : 'csrf token'}
                spellCheck={false}
                className="h-10 min-w-0 flex-1 rounded-md border border-line bg-surface px-3 font-mono text-[13px] text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-[var(--brand-ring)]"
              />
              {leaked && (
                <Button variant="secondary" size="sm" onClick={() => setPayload({ ...payload, token: String(scenario.sessionToken) })}>
                  <ClipboardCopy className="size-3.5" /> Paste
                </Button>
              )}
            </div>
            <p className="mt-1.5 text-[11.5px] text-muted">
              {leaked
                ? 'The token leaked in the victim’s page URL — paste it into the forged request.'
                : scenario.defense.token === 'unbound'
                  ? 'The server accepts any well-formed token. Bring your own.'
                  : 'The attacker normally cannot read the victim’s token.'}
            </p>
          </>
        )}

        <p className={cn('text-[11px] font-semibold uppercase tracking-wide text-faint', showToken ? 'mt-4' : 'mt-4')}>3 · Generated page source</p>
      </div>

      <CodeBlock code={source} title="win-a-prize.html" wrap />
    </div>
  )
}

function AttackerLure({ submitting }: { submitting?: boolean }) {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-md rounded-xl border border-line bg-surface p-6 text-center">
        <Trophy className="mx-auto size-10 text-warning" />
        <h3 className="mt-3 text-lg font-bold text-ink">Congratulations!</h3>
        <p className="mt-1 text-sm text-muted">You are our lucky visitor. Claim your brand-new iPhone now.</p>
        <span className="mt-4 inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#ff5b2e] to-[#ffb020] px-4 py-2 text-sm font-bold text-[#170b06]">
          <Gift className="size-4" /> Claim your prize
        </span>
        {submitting && (
          <p className="scene-in mt-3 font-mono text-[11px] text-danger">&lt;form&gt; auto-submitting hidden request…</p>
        )}
      </div>
    </div>
  )
}

function Collapse({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-surface-2 p-4">
      <div className="flex items-center gap-2 text-brand">
        {icon}
        <p className="text-[13px] font-semibold text-ink">{title}</p>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">{children}</p>
    </div>
  )
}

function Hints({ hints }: { hints: string[] }) {
  const [shown, setShown] = useState(0)
  if (hints.length === 0) return null
  return (
    <div className="rounded-lg border border-line bg-surface-2 p-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="size-4 text-warning" />
        <p className="text-[13px] font-semibold text-ink">Nudges</p>
        <span className="ml-auto text-[11px] text-faint">
          {shown}/{hints.length} revealed
        </span>
      </div>
      <ul className="mt-2 flex flex-col gap-2">
        {hints.slice(0, shown).map((h, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-muted">
            <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-warning-soft text-[10px] font-bold text-warning">
              {i + 1}
            </span>
            {h}
          </li>
        ))}
      </ul>
      {shown < hints.length ? (
        <button
          type="button"
          onClick={() => setShown((s) => s + 1)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[12px] font-medium text-muted transition hover:border-line-strong hover:text-ink"
        >
          <Eye className="size-3.5" /> {shown === 0 ? 'Reveal a hint' : 'Reveal another hint'}
        </button>
      ) : (
        <p className="mt-3 text-[12px] text-faint">That’s all the nudges — you’re on your own now.</p>
      )}
    </div>
  )
}

function StateBox({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className={cn('rounded-lg border p-3', danger ? 'border-danger/40 bg-danger-soft' : 'border-line bg-surface-2')}>
      <p className="text-[11px] uppercase tracking-wide text-faint">{label}</p>
      <p className={cn('mt-1 break-all font-mono text-[12.5px]', danger ? 'font-semibold text-danger' : 'text-muted')}>{value}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Defense panel
 * ------------------------------------------------------------------ */
function DefensePanel({
  defense,
  setDef,
  onApplySecure,
  onResetVuln,
}: {
  defense: Defense
  setDef: <K extends keyof Defense>(key: K, value: Defense[K]) => void
  onApplySecure: () => void
  onResetVuln: () => void
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <Lock className="size-4 text-brand" />
        <h3 className="text-sm font-semibold text-ink">Defense panel</h3>
        <span className="ml-auto text-[11px] text-faint">you are the defender</span>
      </div>

      <div className="flex flex-col gap-3.5">
        <ToggleRow label="Require a session-bound CSRF token" hint="Server compares a per-session secret only the victim’s pages know." checked={defense.token === 'bound'} onChange={(v) => setDef('token', v ? 'bound' : 'none')} />
        <ToggleRow label="Cookie: SameSite=Strict" hint="Browser refuses to attach the session cookie to any cross-site request." checked={defense.sameSite === 'strict'} onChange={(v) => setDef('sameSite', v ? 'strict' : 'none')} />
        <ToggleRow label="Validate Origin / Referer" hint="Reject requests whose Origin is not the site’s own." checked={defense.originCheck} onChange={(v) => setDef('originCheck', v)} />
        <ToggleRow label="POST-only endpoint" hint="Stop state changes from firing on a GET (image/link) too." checked={defense.requirePost} onChange={(v) => setDef('requirePost', v)} />
        <ToggleRow label="Require a custom header" hint="Forces a CORS preflight a cross-site page cannot satisfy." checked={defense.customHeader} onChange={(v) => setDef('customHeader', v)} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <Button variant="secondary" size="sm" onClick={onApplySecure}>
          <Wrench className="size-3.5" /> Apply recommended set
        </Button>
        <Button variant="ghost" size="sm" onClick={onResetVuln}>
          <RotateCcw className="size-3.5" /> Reset to vulnerable
        </Button>
      </div>
    </div>
  )
}

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[13px] font-medium text-ink">{label}</p>
        <p className="text-[11.5px] leading-snug text-muted">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} label={label} />
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Recap + knowledge check
 * ------------------------------------------------------------------ */
function fixesFrom(secure: Defense): string[] {
  const out: string[] = []
  if (secure.token === 'bound') out.push('a session-bound CSRF token')
  if (secure.sameSite === 'strict') out.push('SameSite=Strict')
  if (secure.originCheck) out.push('Origin/Referer validation')
  if (secure.requirePost) out.push('a POST-only endpoint')
  if (secure.customHeader) out.push('a required custom header')
  if (secure.refererCheck === 'exact') out.push('a strict Referer check')
  if (!secure.methodOverride) out.push('no method-override confusion')
  return out
}

const UNIVERSAL_QUIZ: { q: string; options: { text: string; correct?: boolean }[] }[] = [
  {
    q: 'What makes a request “cross-site” for CSRF purposes?',
    options: [
      { text: 'It is sent over HTTP instead of HTTPS' },
      { text: 'It originates from a different site than the one being attacked, so the browser applies SameSite rules', correct: true },
      { text: 'It uses POST instead of GET' },
      { text: 'It carries a session cookie' },
    ],
  },
  {
    q: 'Which is the strongest, most reliable CSRF defense?',
    options: [
      { text: 'A session-bound, unpredictable CSRF token on every state-changing request', correct: true },
      { text: 'Hiding the form from view' },
      { text: 'Renaming the endpoint' },
      { text: 'Using cookies' },
    ],
  },
]

function RecapStep({ scenario, solved }: { scenario: LabScenario; solved: boolean }) {
  const [answers, setAnswers] = useState<(number | null)[]>([null, null])
  const allCorrect = UNIVERSAL_QUIZ.every((q, i) => answers[i] != null && q.options[answers[i]!].correct === true)
  const fixes = fixesFrom(scenario.secure)

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <StepHeader kicker="Step 6 — consolidation" title="Root cause, fix, and proof">
          {solved ? 'You exploited the flaw and then closed it. That exploit → fix → retest loop is the whole job.' : 'Work through the recap and the knowledge check to lock in the lesson.'}
        </StepHeader>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-danger/30 bg-danger-soft p-4">
            <div className="flex items-center gap-2 text-danger">
              <ShieldAlert className="size-4" />
              <p className="text-[13px] font-semibold text-ink">Root cause</p>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{scenario.takeaway}</p>
          </div>
          <div className="rounded-lg border border-success/30 bg-success-soft p-4">
            <div className="flex items-center gap-2 text-success">
              <ShieldCheck className="size-4" />
              <p className="text-[13px] font-semibold text-ink">The fix</p>
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              This endpoint should require {fixes.join(', ')}. No single setting is enough on its own —
              layer them for defense in depth.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {scenario.walkthrough.map((w, i) => (
            <div key={i} className="rounded-lg border border-line bg-surface-2 p-4">
              <p className="text-[13px] font-semibold text-ink">{w.title}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{w.body}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Lightbulb className="size-4 text-brand" />
          <h3 className="text-sm font-semibold text-ink">Knowledge check</h3>
          {allCorrect && (
            <Badge tone="success" className="ml-auto">
              <Check className="size-3" /> All correct
            </Badge>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-5">
          {UNIVERSAL_QUIZ.map((q, qi) => {
            const chosen = answers[qi]
            return (
              <div key={qi} className="flex flex-col gap-2">
                <p className="text-sm font-medium text-ink">
                  {qi + 1}. {q.q}
                </p>
                <div className="flex flex-col gap-1.5">
                  {q.options.map((o, oi) => {
                    const isChosen = chosen === oi
                    return (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                        className={cn(
                          'flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-[13px] transition',
                          isChosen ? (o.correct ? 'border-success/50 bg-success-soft text-ink' : 'border-danger/50 bg-danger-soft text-ink') : 'border-line bg-surface-2 text-muted hover:border-line-strong',
                        )}
                      >
                        <span className={cn('grid size-4 shrink-0 place-items-center rounded-full border', isChosen ? (o.correct ? 'border-success bg-success text-white' : 'border-danger bg-danger text-white') : 'border-line-strong')}>
                          {isChosen && (o.correct ? <Check className="size-2.5" /> : <Ban className="size-2.5" />)}
                        </span>
                        {o.text}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Shared bits
 * ------------------------------------------------------------------ */
function IdentityChip({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2 py-0.5 text-[11px] text-muted">
      <User className="size-3 text-accent" /> {name}
    </span>
  )
}

function Banner({ tone, icon, title, children }: { tone: 'danger' | 'success'; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className={cn('mt-4 flex items-start gap-3 rounded-xl border p-4', tone === 'danger' ? 'border-danger/40 bg-danger-soft' : 'border-success/40 bg-success-soft')}>
      <span className={cn('mt-0.5 shrink-0', tone === 'danger' ? 'text-danger' : 'text-success')}>{icon}</span>
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{children}</p>
      </div>
    </div>
  )
}

const STATUS_STYLE: Record<TraceStatus, string> = {
  ok: 'border-success/40 bg-success-soft text-success',
  block: 'border-danger/40 bg-danger-soft text-danger',
  warn: 'border-warning/40 bg-warning-soft text-warning',
  info: 'border-line bg-surface-2 text-muted',
}

function TraceList({ result }: { result: AttackResult }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <Flag className="size-4 text-brand" />
        <h3 className="text-sm font-semibold text-ink">What happened, hop by hop</h3>
      </div>
      <ol className="flex flex-col">
        {result.trace.map((s, i) => (
          <li key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn('grid size-7 shrink-0 place-items-center rounded-full border text-[11px] font-bold', STATUS_STYLE[s.status])}>
                {s.status === 'ok' ? <Check className="size-3.5" /> : s.status === 'block' ? <ShieldAlert className="size-3.5" /> : s.status === 'warn' ? <AlertTriangle className="size-3.5" /> : i + 1}
              </span>
              {i < result.trace.length - 1 && <span className="my-0.5 w-px flex-1 bg-line" />}
            </div>
            <div className="pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-faint">{s.phase}</span>
                <span className="text-sm font-semibold text-ink">{s.label}</span>
              </div>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function CaseFile({ scenario, pwned, defended, fired }: { scenario: LabScenario; pwned: boolean; defended: boolean; fired: boolean }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-sky-400/30 to-sky-600/20 text-sm font-bold text-sky-200">{scenario.victim.name[0]}</span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{scenario.victim.name}</p>
          <p className="truncate font-mono text-[11px] text-faint">{scenario.victim.site}</p>
        </div>
        <span className="ml-auto">
          {defended ? <Badge tone="success">Defended</Badge> : pwned ? <Badge tone="danger">Compromised</Badge> : fired ? <Badge tone="warning">Attempted</Badge> : <Badge tone="neutral">Target</Badge>}
        </span>
      </div>
      <p className="mt-3 text-[12.5px] leading-relaxed text-muted">{scenario.victim.disclosure}</p>
      <ul className="mt-4 flex flex-col gap-2.5 border-t border-line pt-4">
        {scenario.objectives.map((o, i) => {
          const done = i === 0 ? pwned || defended : defended
          return (
            <li key={i} className="flex gap-2.5 text-[13px]">
              <span className={cn('mt-0.5 grid size-[1.05rem] shrink-0 place-items-center rounded-full border text-[10px]', done ? 'border-success/50 bg-success text-white' : 'border-line-strong text-faint')}>
                {done ? <Check className="size-3" /> : i + 1}
              </span>
              <span className={done ? 'text-muted line-through' : 'text-muted'}>{o}</span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

function PostureCard({ defense }: { defense: Defense }) {
  const rows = [
    { label: 'CSRF token', ok: defense.token === 'bound', value: defense.token === 'bound' ? 'session-bound' : defense.token === 'none' ? 'none' : defense.token },
    { label: 'SameSite', ok: defense.sameSite === 'strict', value: defense.sameSite },
    { label: 'Origin check', ok: defense.originCheck, value: defense.originCheck ? 'on' : 'off' },
    { label: 'Method', ok: defense.requirePost, value: defense.requirePost ? 'POST-only' : 'GET allowed' },
    { label: 'Custom header', ok: defense.customHeader, value: defense.customHeader ? 'required' : 'none' },
  ]
  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-ink">Endpoint posture</h3>
      <ul className="mt-3 flex flex-col gap-2">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center justify-between gap-2 text-[12.5px]">
            <span className="text-muted">{r.label}</span>
            <span className={cn('inline-flex items-center gap-1 font-mono text-[11px]', r.ok ? 'text-success' : 'text-danger')}>
              <span className={cn('size-1.5 rounded-full', r.ok ? 'bg-success' : 'bg-danger')} />
              {r.value}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

/* ------------------------------------------------------------------ *
 * Request / response builders + findings
 * ------------------------------------------------------------------ */
function bodyOf(params: Record<string, string>) {
  return Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')
}

function cookieAttached(d: Defense, vector: Vector): boolean {
  const spec = VECTORS[vector]
  const topLevelGetNav = spec.kind === 'navigation' && spec.method === 'GET'
  if (d.sameSite === 'none') return true
  if (d.sameSite === 'lax') return topLevelGetNav
  return false
}

function legitGet(scenario: LabScenario, id: number): Exchange {
  const request: HttpRequest = {
    method: 'GET',
    path: '/account',
    headers: [
      { name: 'Host', value: scenario.victim.site },
      { name: 'User-Agent', value: UA },
      { name: 'Origin', value: `https://${scenario.victim.site}`, flag: 'good' },
      { name: 'Referer', value: `https://${scenario.victim.site}/account`, flag: 'good' },
      { name: 'Cookie', value: `session=${SESSION_COOKIE}` },
    ],
  }
  const response: HttpResponse = {
    status: '200 OK',
    headers: [{ name: 'Content-Type', value: 'text/html' }],
    body: `${scenario.victim.site} account page`,
  }
  const findings: Finding[] = [
    { level: 'info', title: 'Authenticated page load', detail: `The browser attached ${scenario.victim.name}’s session cookie to this same-origin request.` },
    { level: 'warning', title: 'Session cookie is the only gate', detail: `Any request carrying this cookie to ${scenario.action.path} is treated as ${scenario.victim.name}.` },
  ]
  return { id, kind: 'legit', request, response, findings }
}

function forgedRequest(scenario: LabScenario, d: Defense, vector: Vector, token: string): HttpRequest {
  const spec = VECTORS[vector]
  const params: Record<string, string> = { ...scenario.action.params }
  const t = token.trim()
  if (t) params.csrf_token = t

  const headers: HttpHeader[] = [
    { name: 'Host', value: scenario.victim.site },
    { name: 'User-Agent', value: UA },
  ]
  let path = scenario.action.path
  let body: string | undefined

  if (spec.method === 'POST') {
    body = bodyOf(params)
    headers.push({ name: 'Content-Type', value: 'application/x-www-form-urlencoded' })
    headers.push({ name: 'Content-Length', value: String(body.length) })
  } else {
    path = `${scenario.action.path}?${new URLSearchParams(params).toString()}`
  }

  headers.push({ name: 'Origin', value: ATTACKER_ORIGIN, flag: d.originCheck ? 'default' : 'suspect' })
  headers.push({ name: 'Referer', value: ATTACKER_PAGE, flag: d.refererCheck === 'off' ? 'suspect' : 'default' })
  if (cookieAttached(d, vector)) headers.push({ name: 'Cookie', value: `session=${SESSION_COOKIE}`, flag: 'suspect' })

  return { method: spec.method, path, headers, body }
}

function successResponse(scenario: LabScenario): HttpResponse {
  return {
    status: '302 Found',
    headers: [
      { name: 'Location', value: '/account', flag: 'muted' },
      { name: 'Content-Type', value: 'text/html' },
    ],
    body: `${scenario.action.label} applied: ${scenario.action.after}`,
  }
}

function blockedResponse(blockedBy?: string): HttpResponse {
  return {
    status: '403 Forbidden',
    headers: [{ name: 'Content-Type', value: 'text/html' }],
    body: blockReason(blockedBy),
  }
}

function blockReason(blockedBy?: string): string {
  const reasons: Record<string, string> = {
    'SameSite=STRICT': 'The session cookie is SameSite=Strict, so the browser did not attach it. The server saw an anonymous request.',
    'SameSite=LAX': 'The session cookie is SameSite=Lax and this is not a top-level GET, so the browser withheld it.',
    'Missing CSRF token': 'No csrf_token was present in the request body. A session-bound token is required.',
    'Session-bound CSRF token': 'The supplied CSRF token did not match the value bound to the session.',
    'Cookie-bound CSRF token': 'The token did not match the value in the victim’s cookie.',
    'Origin check': 'The Origin header is not this site. A page cannot forge its own origin.',
    'POST-only endpoint': 'The endpoint only accepts POST; this method was not allowed.',
    'Required custom header': 'A required custom header was missing — a cross-site HTML request cannot set one without a CORS preflight.',
    'Referer check': 'The Referer header did not match the expected origin.',
  }
  return reasons[blockedBy ?? ''] ?? 'A server-side defence rejected the request.'
}

function forgedFindings(d: Defense, vector: Vector, attached: boolean): Finding[] {
  const spec = VECTORS[vector]
  const out: Finding[] = []

  if (attached) {
    out.push({ level: 'danger', title: 'Session cookie attached cross-site', detail: `SameSite=${d.sameSite} lets the browser send the session cookie on a request the attacker triggered.` })
  } else {
    out.push({ level: 'success', title: 'Cookie withheld cross-site', detail: `SameSite=${d.sameSite.toUpperCase()} stops the browser attaching the session cookie on this ${spec.method} ${spec.kind}.` })
  }

  if (spec.method === 'GET') {
    out.push(d.requirePost ? { level: 'success', title: 'Endpoint is POST-only', detail: 'A GET vector is rejected before it can change anything.' } : { level: 'warning', title: 'Endpoint also accepts GET', detail: 'The same change can be triggered with no form at all.' })
  }

  if (d.token === 'none') {
    out.push({ level: 'danger', title: 'No anti-CSRF token', detail: 'Nothing in the request proves the user intended the change.' })
  } else {
    out.push({ level: 'success', title: 'CSRF token enforced', detail: 'The server validates a token the attacker cannot read or guess.' })
  }

  if (!d.originCheck) {
    out.push({ level: 'danger', title: `Origin is ${ATTACKER_ORIGIN}`, detail: 'The flag marks a request from a foreign origin; the server ignores it.' })
  } else {
    out.push({ level: 'success', title: 'Origin validated', detail: 'The server compares Origin against its own site and drops foreign-origin requests.' })
  }

  if (d.customHeader) {
    out.push({ level: 'success', title: 'Custom header required', detail: 'A cross-site page cannot set the custom header without a CORS preflight the server refuses.' })
  }

  if (d.refererCheck === 'contains') {
    out.push({ level: 'warning', title: 'Substring Referer match', detail: 'The server only checks whether Referer contains the domain — easy to satisfy.' })
  } else if (d.refererCheck === 'if-present') {
    out.push({ level: 'warning', title: 'Referer skipped when absent', detail: 'Omitting the Referer header bypasses the check entirely.' })
  }

  return out
}

function normalize(raw: string, accountUrl: string): string {
  let u = raw.trim()
  if (!/^https?:\/\//i.test(u)) u = `https://${u.replace(/^\/+/, '')}`
  try {
    const parsed = new URL(u)
    if (parsed.hostname === 'evil.example') return ATTACKER_PAGE
    if (parsed.hostname === new URL(accountUrl).hostname) {
      return parsed.pathname === '/' || parsed.pathname === '' ? accountUrl : `${parsed.origin}${parsed.pathname}`
    }
  } catch {
    /* keep raw */
  }
  return u
}
