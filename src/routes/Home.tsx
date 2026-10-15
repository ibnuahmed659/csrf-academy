import {
  ArrowRight,
  Beaker,
  BookOpen,
  Check,
  Clapperboard,
  Cookie,
  Server,
  ShieldAlert,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { CHAPTERS } from '@/content/chapters'
import { LAB_SCENARIOS } from '@/lib/lab'
import { TUTORIALS } from '@/lib/tutorial/tutorials'
import { useProgress } from '@/lib/progress'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Logo } from '@/components/layout/Logo'
import { cn } from '@/lib/utils'

export default function Home() {
  const { labs, tutorials, completed } = useProgress()

  const features = [
    {
      icon: Clapperboard,
      title: 'Animated video tutorials',
      body: 'Narrated, scrubbable walkthroughs of every concept — from the SameSite story to token failure modes.',
      to: '/tutorials',
      cta: 'Watch',
    },
    {
      icon: Beaker,
      title: 'Live attack labs',
      body: 'Forge real requests against simulated targets, trace every hop, then flip the defenses and break your own exploit.',
      to: '/labs',
      cta: 'Open a lab',
    },
    {
      icon: BookOpen,
      title: 'The CSRF handbook',
      body: 'Concise chapters that explain the “why” behind each attack and defense, with copyable payloads.',
      to: '/learn',
      cta: 'Read',
    },
    {
      icon: Terminal,
      title: 'Forge playground',
      body: 'Assemble a request, pick a vector, set the defenses, and watch the outcome resolve in real time.',
      to: '/playground',
      cta: 'Experiment',
    },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-0 stage-grid opacity-[0.35]" />
        <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-[#ff5b2e]/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 size-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="container-page relative grid gap-12 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div className="flex flex-col items-start gap-6">
            <Badge tone="brand">
              <Sparkles className="size-3" /> Interactive security academy
            </Badge>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Learn to <span className="text-ember">forge</span> the request.
              <br />
              Then learn to <span className="text-gradient">stop it</span>.
            </h1>
            <p className="max-w-xl text-lg text-muted">
              CSRF Forge is a hands-on academy for Cross-Site Request Forgery.
              Watch animated tutorials, run live attack labs, and master the defenses
              that make forged requests impossible.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/labs" className={cn(buttonVariants({ variant: 'forge', size: 'lg' }), 'gap-2')}>
                Start a lab <ArrowRight className="size-4" />
              </Link>
              <Link to="/tutorials" className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'gap-2')}>
                <Clapperboard className="size-4" /> Watch tutorials
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-sm text-faint">
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-success" /> {TUTORIALS.length} animated tutorials
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-success" /> {LAB_SCENARIOS.length} live labs
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-success" /> {CHAPTERS.length} chapters
              </span>
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* Progress strip */}
      {(labs.length > 0 || tutorials.length > 0 || completed.length > 0) && (
        <section className="border-b border-line bg-canvas-2">
          <div className="container-page grid gap-4 py-6 sm:grid-cols-3">
            <Stat label="Labs solved" value={labs.length} total={LAB_SCENARIOS.length} />
            <Stat label="Tutorials watched" value={tutorials.length} total={TUTORIALS.length} />
            <Stat label="Chapters completed" value={completed.length} total={CHAPTERS.length} />
          </div>
        </section>
      )}

      {/* Features */}
      <section className="container-page py-16">
        <div className="mb-8 flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Everything you need, in one forge
          </h2>
          <p className="max-w-2xl text-muted">
            Theory, animation and live practice — built so the attack finally clicks.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {features.map((f) => {
            const Icon = f.icon
            return (
              <Card key={f.title} className="flex flex-col gap-3 p-6">
                <span className="grid size-11 place-items-center rounded-lg bg-brand-soft text-brand">
                  <Icon className="size-5" />
                </span>
                <h3 className="text-lg font-semibold text-ink">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{f.body}</p>
                <Link
                  to={f.to}
                  className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:gap-2.5"
                >
                  {f.cta} <ArrowRight className="size-4 transition-all" />
                </Link>
              </Card>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-line bg-canvas-2">
        <div className="container-page py-16">
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Watch it. Break it. Fix it.
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                n: '01',
                t: 'Watch the attack unfold',
                b: 'Animated tutorials show the lure, the auto-submit and the cookie crossing sites.',
              },
              {
                n: '02',
                t: 'Forge it yourself',
                b: 'In the labs, build the payload, choose a vector and watch the victim’s account change.',
              },
              {
                n: '03',
                t: 'Defend and verify',
                b: 'Toggle the defenses, re-run your own attack, and confirm it can no longer land.',
              },
            ].map((s) => (
              <div key={s.n} className="flex flex-col gap-2">
                <span className="font-mono text-sm font-bold text-brand">{s.n}</span>
                <h3 className="text-lg font-semibold text-ink">{s.t}</h3>
                <p className="text-sm leading-relaxed text-muted">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ethics + CTA */}
      <section className="container-page py-16">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-8 shadow-card sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-[#ff5b2e]/15 blur-3xl" />
          <div className="relative flex flex-col items-start gap-5">
            <ShieldAlert className="size-8 text-danger" />
            <h2 className="max-w-2xl text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Built for defenders and ethical testers
            </h2>
            <p className="max-w-2xl text-muted">
              Every lab runs locally against simulated targets. Learn the technique, then
              use it only on systems you own or are explicitly authorized to test.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/learn" className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'gap-2')}>
                Start reading <ArrowRight className="size-4" />
              </Link>
              <Link to="/certificate" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}>
                View your certificate
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value, total }: { label: string; value: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl font-bold text-ink">
        {value}
        <span className="text-base font-normal text-faint">/{total}</span>
      </span>
      <span className="text-sm text-muted">{label}</span>
    </div>
  )
}

function HeroVisual() {
  return (
    <div className="relative">
      <div className="stage-grid relative aspect-[4/3] overflow-hidden rounded-2xl border border-line-strong bg-[#0a0b10] shadow-pop">
        <div className="stage-vignette absolute inset-0" />
        <div className="absolute inset-0 p-6">
          <div className="flex items-center justify-between">
            <Logo showWordmark={false} />
            <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 font-mono text-[11px] text-slate-300">
              live attack
            </span>
          </div>

          {/* Nodes */}
          <div className="absolute left-[16%] top-[30%] w-32 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-center text-rose-200 shadow-lg">
            <span className="flex items-center justify-center gap-1.5 text-[12px] font-semibold">
              <ShieldAlert className="size-4" /> Attacker
            </span>
            <span className="text-[10px] opacity-70">evil.example</span>
          </div>
          <div className="absolute left-1/2 top-[62%] w-36 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-400/30 bg-slate-400/10 px-3 py-2 text-center text-slate-200 shadow-lg">
            <span className="flex items-center justify-center gap-1.5 text-[12px] font-semibold">
              <Cookie className="size-4" /> Browser
            </span>
            <span className="text-[10px] opacity-70">trusts cookies</span>
          </div>
          <div className="absolute left-[84%] top-[30%] w-32 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-orange-400/40 bg-orange-400/10 px-3 py-2 text-center text-orange-200 shadow-lg">
            <span className="flex items-center justify-center gap-1.5 text-[12px] font-semibold">
              <Server className="size-4" /> Target
            </span>
            <span className="text-[10px] opacity-70">vault.example</span>
          </div>

          {/* packet */}
          <div
            className="packet-dot absolute left-1/2 top-[62%]"
            style={
              {
                '--pkt-from': '30%',
                '--pkt-to': '78%',
                animationDuration: '2.4s',
              } as CSSProperties
            }
          >
            <span className="whitespace-nowrap rounded-full bg-rose-400 px-2.5 py-1 text-[10px] font-semibold text-black shadow-lg">
              POST + cookie
            </span>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-line bg-surface p-3 shadow-card sm:block">
        <p className="text-[11px] uppercase tracking-wide text-faint">Account</p>
        <p className="font-mono text-[12px] text-danger">attacker@evil.example</p>
      </div>
    </div>
  )
}
