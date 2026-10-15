import { Award, Printer, ShieldAlert } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { CHAPTERS } from '@/content/chapters'
import { LAB_SCENARIOS } from '@/lib/lab'
import { TUTORIALS } from '@/lib/tutorial/tutorials'
import { useProfile } from '@/lib/profile'
import { useProgress } from '@/lib/progress'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Logomark } from '@/components/layout/Logo'
import { hashString } from '@/lib/utils'

const TOTAL = CHAPTERS.length + LAB_SCENARIOS.length + TUTORIALS.length
const ISSUED = new Date().toISOString().slice(0, 10)

export default function Certificate() {
  const { hasProfile, displayName, name, setName } = useProfile()
  const { labs, tutorials, completed } = useProgress()
  const [draft, setDraft] = useState(name)

  const done = labs.length + tutorials.length + completed.length
  const pct = Math.round((done / TOTAL) * 100)
  const complete = done >= TOTAL

  const certId = useMemo(
    () =>
      `CSRF-${hashString(`${displayName}|${done}|${ISSUED}`)
        .toString(36)
        .toUpperCase()
        .padStart(7, '0')}`,
    [displayName, done],
  )

  return (
    <div className="container-page py-10">
      <header className="mb-8 flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-brand">
          <Award className="size-3.5" /> Certificate
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Your certificate of completion
        </h1>
        <p className="max-w-2xl text-muted">
          Finish the chapters, watch the tutorials and solve the labs to complete the
          academy. Your progress and name are stored locally in this browser.
        </p>
      </header>

      {!hasProfile && (
        <Card className="mb-6 p-5">
          <label className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <span className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm font-medium text-ink">Name on the certificate</span>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="e.g. Amina Yusuf"
                className="h-10 rounded-md border border-line bg-surface-2 px-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-[var(--brand-ring)]"
              />
            </span>
            <Button onClick={() => draft.trim() && setName(draft.trim())}>Save name</Button>
          </label>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <Metric label="Chapters" value={completed.length} total={CHAPTERS.length} />
        <Metric label="Tutorials" value={tutorials.length} total={TUTORIALS.length} />
        <Metric label="Labs" value={labs.length} total={LAB_SCENARIOS.length} />
        <Metric label="Overall" value={pct} total={100} suffix="%" />
      </div>

      {!complete && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-warning/40 bg-warning-soft p-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" />
          <p className="text-sm text-muted">
            You’re <span className="font-semibold text-ink">{pct}%</span> of the way there.
            The certificate below is a live preview — finish everything for the real thing.
          </p>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer className="size-4" /> Print / save as PDF
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <CertificateDoc
          name={displayName}
          certId={certId}
          issued={ISSUED}
          chapters={completed.length}
          tutorials={tutorials.length}
          labs={labs.length}
          complete={complete}
        />
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  total,
  suffix,
}: {
  label: string
  value: number
  total: number
  suffix?: string
}) {
  return (
    <Card className="p-4">
      <p className="text-[11px] uppercase tracking-wide text-faint">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">
        {value}
        <span className="text-base font-normal text-faint">
          /{total}
          {suffix}
        </span>
      </p>
    </Card>
  )
}

function CertificateDoc({
  name,
  certId,
  issued,
  chapters,
  tutorials,
  labs,
  complete,
}: {
  name: string
  certId: string
  issued: string
  chapters: number
  tutorials: number
  labs: number
  complete: boolean
}) {
  return (
    <div className="cert-print mx-auto w-full max-w-3xl">
      <div
        className="relative overflow-hidden rounded-lg"
        style={{ background: '#efe7d2', border: '2px solid #c9a227', padding: '10px' }}
      >
        <div
          className="relative overflow-hidden rounded-sm"
          style={{ background: '#fffdf8', border: '1px solid #e8dcb8', padding: '44px 40px' }}
        >
          <Corner className="absolute left-4 top-4" />
          <Corner className="absolute right-4 top-4 rotate-90" />
          <Corner className="absolute bottom-4 right-4 rotate-180" />
          <Corner className="absolute bottom-4 left-4 -rotate-90" />

          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Logomark className="size-72 opacity-[0.035]" />
          </div>

          <div className="relative flex flex-col items-center text-center">
            <div className="flex items-center gap-2.5">
              <Logomark className="size-11" />
              <span className="text-[20px] font-extrabold tracking-tight">
                <span style={{ color: '#1b1420' }}>CSRF</span>
                <span style={{ color: '#d9481c' }}>Forge</span>
              </span>
            </div>
            <p
              className="mt-2 text-[11px] font-semibold uppercase tracking-[0.4em]"
              style={{ color: '#9a7b2e' }}
            >
              Security Academy
            </p>

            <h2
              className="mt-6 font-serif text-[34px] leading-none"
              style={{ color: '#1b1420' }}
            >
              Certificate of Completion
            </h2>

            <p className="mt-5 text-[13px]" style={{ color: '#5c657a' }}>
              This is to certify that
            </p>
            <p
              className="mt-2 font-serif text-[42px] leading-tight"
              style={{ color: '#1b1420' }}
            >
              {name}
            </p>
            <div
              className="mt-3 h-px w-64"
              style={{ background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }}
            />

            <p className="mt-5 text-[13px]" style={{ color: '#5c657a' }}>
              has completed the CSRF Forge curriculum
            </p>
            <p className="mt-1 text-[15px] font-semibold" style={{ color: '#d9481c' }}>
              Cross-Site Request Forgery — Attack &amp; Defense
            </p>

            <div className="mt-7 grid w-full max-w-lg grid-cols-3 gap-3">
              <Stat label="Chapters" value={`${chapters}/${CHAPTERS.length}`} />
              <Stat label="Tutorials" value={`${tutorials}/${TUTORIALS.length}`} />
              <Stat label="Labs" value={`${labs}/${LAB_SCENARIOS.length}`} />
            </div>

            <div className="mt-9 grid w-full grid-cols-3 items-end">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[12px]" style={{ color: '#5c657a' }}>
                  {issued}
                </span>
                <span
                  className="w-28 border-t pt-1 text-[10px] uppercase tracking-wider"
                  style={{ borderColor: '#c9c1a5', color: '#8a7b55' }}
                >
                  Date
                </span>
              </div>
              <div className="flex justify-center">
                <Seal />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="font-serif text-[18px]" style={{ color: '#1b1420' }}>
                  CSRF Forge
                </span>
                <span
                  className="w-28 border-t pt-1 text-[10px] uppercase tracking-wider"
                  style={{ borderColor: '#c9c1a5', color: '#8a7b55' }}
                >
                  Curriculum
                </span>
              </div>
            </div>

            <p className="mt-7 text-[11px] tracking-wide" style={{ color: '#8a7b55' }}>
              Certificate ID · {certId}
            </p>
            <p className="mt-1 text-[10px]" style={{ color: '#a99a76' }}>
              {complete ? 'Verified locally' : 'Preview — curriculum in progress'} · no
              account required
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-md px-3 py-2"
      style={{ background: '#f6f1e4', border: '1px solid #e8dcb8' }}
    >
      <p className="text-[10px] uppercase tracking-wider" style={{ color: '#9a7b2e' }}>
        {label}
      </p>
      <p className="text-[15px] font-semibold" style={{ color: '#1b1420' }}>
        {value}
      </p>
    </div>
  )
}

function Corner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} width="40" height="40" fill="none">
      <path d="M1 14 V1 H14" stroke="#c9a227" strokeWidth="2" />
      <path d="M1 22 V4 H19" stroke="#e0c878" strokeWidth="1" />
      <circle cx="5" cy="5" r="1.6" fill="#c9a227" />
    </svg>
  )
}

function Seal() {
  const id = useId()
  const gid = `${id}-g`
  return (
    <svg viewBox="0 0 100 100" width="96" height="96" aria-hidden>
      <defs>
        <radialGradient id={gid} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#f6dd9a" />
          <stop offset="0.55" stopColor="#d9b24a" />
          <stop offset="1" stopColor="#a9821f" />
        </radialGradient>
      </defs>
      <path d="M28 84 L22 98 L36 92 L44 99 L50 86 Z" fill="#c9a227" opacity="0.7" />
      <path d="M72 84 L78 98 L64 92 L56 99 L50 86 Z" fill="#c9a227" opacity="0.7" />
      <circle cx="50" cy="48" r="34" fill={`url(#${gid})`} stroke="#8a6a17" strokeWidth="1.5" />
      <circle cx="50" cy="48" r="27" fill="none" stroke="#7a5c12" strokeWidth="1" />
      <text
        x="50"
        y="45"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="11"
        fontWeight="700"
        fill="#4a3608"
      >
        CSRF
      </text>
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="10"
        fontWeight="700"
        fill="#4a3608"
      >
        FORGE
      </text>
      <path
        d="M43 66 l4 4 l9 -10"
        fill="none"
        stroke="#4a3608"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
