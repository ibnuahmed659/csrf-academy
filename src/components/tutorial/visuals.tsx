import {
  ArrowRight,
  Ban,
  CreditCard,
  Globe,
  Monitor,
  Server,
  ShieldAlert,
  User,
} from 'lucide-react'
import type { BrowserLine, FlowNode, PacketTone, Visual } from '@/lib/tutorial/types'
import { cn } from '@/lib/utils'

const nodeTone: Record<NonNullable<FlowNode['tone']>, string> = {
  victim: 'border-sky-400/40 bg-sky-400/10 text-sky-200',
  attacker: 'border-rose-400/40 bg-rose-400/10 text-rose-200',
  target: 'border-orange-400/40 bg-orange-400/10 text-orange-200',
  browser: 'border-slate-400/30 bg-slate-400/10 text-slate-200',
  neutral: 'border-white/15 bg-white/5 text-slate-200',
}

const packetLine: Record<PacketTone, string> = {
  request: '#38bdf8',
  cookie: '#fbbf24',
  forged: '#fb7185',
  blocked: '#64748b',
  good: '#34d399',
}

function nodeIcon(node: FlowNode) {
  const cls = 'size-4'
  if (node.tone === 'victim') return <User className={cls} />
  if (node.tone === 'attacker') return <ShieldAlert className={cls} />
  if (node.tone === 'target') return <Server className={cls} />
  if (node.tone === 'browser') return <Monitor className={cls} />
  return <Globe className={cls} />
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function SceneVisual({ visual, progress }: { visual: Visual; progress: number }) {
  switch (visual.kind) {
    case 'title':
      return <TitleScene visual={visual} progress={progress} />
    case 'bullets':
      return <BulletsScene visual={visual} progress={progress} />
    case 'code':
      return <CodeScene visual={visual} progress={progress} />
    case 'flow':
      return <FlowScene visual={visual} progress={progress} />
    case 'browser':
      return <BrowserScene visual={visual} progress={progress} />
    case 'impact':
      return <ImpactScene visual={visual} progress={progress} />
  }
}

function TitleScene({
  visual,
  progress,
}: {
  visual: Extract<Visual, { kind: 'title' }>
  progress: number
}) {
  const reveal = Math.min(1, progress * 2.2)
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-8 text-center">
      {visual.badge && (
        <span
          className="rounded-full border border-orange-400/40 bg-orange-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-200"
          style={{ opacity: reveal }}
        >
          {visual.badge}
        </span>
      )}
      <h2
        className="max-w-3xl font-serif text-3xl leading-tight text-white sm:text-5xl"
        style={{ opacity: reveal, transform: `translateY(${(1 - reveal) * 16}px)` }}
      >
        {visual.title}
      </h2>
      {visual.subtitle && (
        <p
          className="max-w-2xl text-sm text-slate-300 sm:text-base"
          style={{ opacity: Math.max(0, reveal - 0.3) }}
        >
          {visual.subtitle}
        </p>
      )}
    </div>
  )
}

function BulletsScene({
  visual,
  progress,
}: {
  visual: Extract<Visual, { kind: 'bullets' }>
  progress: number
}) {
  const per = 0.82 / visual.items.length
  return (
    <div className="flex h-full w-full flex-col justify-center gap-5 px-8 sm:px-14">
      {visual.heading && (
        <h3 className="font-serif text-2xl text-white sm:text-3xl">{visual.heading}</h3>
      )}
      <ul className="flex flex-col gap-3.5">
        {visual.items.map((item, i) => {
          const reveal = Math.min(1, Math.max(0, (progress - i * per - 0.08) / 0.14))
          return (
            <li
              key={item}
              className="flex items-start gap-3 text-base text-slate-200 sm:text-lg"
              style={{ opacity: reveal, transform: `translateX(${(1 - reveal) * 18}px)` }}
            >
              <span className="mt-2 inline-block size-2 shrink-0 rounded-full bg-gradient-to-r from-orange-400 to-amber-300" />
              <span>{item}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function CodeScene({
  visual,
  progress,
}: {
  visual: Extract<Visual, { kind: 'code' }>
  progress: number
}) {
  const shown = Math.floor(visual.code.length * Math.min(1, progress * 1.25))
  const text = visual.code.slice(0, shown)
  return (
    <div className="flex h-full w-full flex-col justify-center px-6 sm:px-12">
      {visual.title && (
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-slate-400">
          {visual.title}
        </p>
      )}
      <pre className="overflow-hidden rounded-lg border border-white/10 bg-black/50 p-4 font-mono text-[12.5px] leading-relaxed text-emerald-200 sm:text-sm">
        <code className="caret">{text}</code>
      </pre>
    </div>
  )
}

function FlowScene({
  visual,
  progress,
}: {
  visual: Extract<Visual, { kind: 'flow' }>
  progress: number
}) {
  const byId = Object.fromEntries(visual.nodes.map((n) => [n.id, n]))
  return (
    <div className="relative h-full w-full">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        {visual.packets.map((p, i) => {
          const a = byId[p.from]
          const b = byId[p.to]
          if (!a || !b) return null
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={packetLine[p.tone ?? 'request']}
              strokeOpacity={0.28}
              strokeWidth={0.5}
              strokeDasharray="2 1.6"
            />
          )
        })}
      </svg>

      {visual.nodes.map((node, i) => {
        const reveal = Math.min(1, Math.max(0, (progress - i * 0.04) / 0.16))
        return (
          <div
            key={node.id}
            className={cn(
              'absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border px-3 py-2 text-center shadow-lg backdrop-blur-sm',
              nodeTone[node.tone ?? 'neutral'],
            )}
            style={{ left: `${node.x}%`, top: `${node.y}%`, opacity: reveal, transform: `translate(-50%,-50%) scale(${0.9 + reveal * 0.1})` }}
          >
            <span className="flex items-center justify-center gap-1.5 text-[12px] font-semibold sm:text-[13px]">
              {nodeIcon(node)}
              {node.label}
            </span>
            {node.sub && <span className="mt-0.5 block text-[10px] opacity-70">{node.sub}</span>}
          </div>
        )
      })}

      {visual.packets.map((p, i) => {
        const a = byId[p.from]
        const b = byId[p.to]
        if (!a || !b) return null
        const local = (progress - p.at) / 0.3
        if (local < 0) return null
        const t = Math.min(1, local)
        const x = lerp(a.x, b.x, t)
        const y = lerp(a.y, b.y, t)
        return (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%`, opacity: 1 - Math.max(0, local - 0.7) * 3 }}
          >
            <span
              className="flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold text-black shadow-lg sm:text-[11px]"
              style={{ background: packetLine[p.tone ?? 'request'] }}
            >
              {p.tone === 'blocked' && <Ban className="size-3" />}
              {p.label}
            </span>
          </div>
        )
      })}

      {visual.note && (
        <p
          className="absolute inset-x-0 bottom-3 mx-auto max-w-xl px-4 text-center text-[12px] text-slate-400"
          style={{ opacity: Math.max(0, progress - 0.5) * 2 }}
        >
          {visual.note}
        </p>
      )}
    </div>
  )
}

function BrowserScene({
  visual,
  progress,
}: {
  visual: Extract<Visual, { kind: 'browser' }>
  progress: number
}) {
  const per = 0.85 / Math.max(1, visual.lines.length)
  return (
    <div className="flex h-full w-full flex-col justify-center px-4 sm:px-10">
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-[#0c0d13] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2">
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-400/80" />
            <span className="size-2.5 rounded-full bg-amber-300/80" />
            <span className="size-2.5 rounded-full bg-emerald-400/80" />
          </span>
          <span className="ml-2 flex-1 truncate rounded-md bg-black/40 px-2.5 py-1 font-mono text-[11px] text-slate-300">
            {visual.url}
          </span>
        </div>
        <div className="p-4">
          {visual.title && (
            <p className="mb-3 text-sm font-semibold text-slate-200">{visual.title}</p>
          )}
          <div className="flex flex-col gap-2">
            {visual.lines.map((line, i) => {
              const reveal = Math.min(1, Math.max(0, (progress - i * per - 0.05) / 0.1))
              return (
                <div key={i} style={{ opacity: reveal, transform: `translateY(${(1 - reveal) * 8}px)` }}>
                  <BrowserLineView line={line} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function BrowserLineView({ line }: { line: BrowserLine }) {
  switch (line.type) {
    case 'text':
      return <p className="text-sm text-slate-300">{line.value}</p>
    case 'note':
      return <p className="font-mono text-[11px] text-slate-500">{line.value}</p>
    case 'field':
      return (
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <span className="w-28 text-slate-400">{line.label}</span>
          <span className="flex-1 rounded-md border border-white/10 bg-black/30 px-2.5 py-1.5 font-mono text-[12px] text-slate-200">
            {line.value}
          </span>
        </label>
      )
    case 'hidden':
      return (
        <div className="flex items-center gap-2 rounded-md border border-rose-400/30 bg-rose-500/10 px-2.5 py-1.5 text-[12px] text-rose-200">
          <span className="font-mono opacity-70">&lt;input type=hidden&gt;</span>
          <span className="font-mono">
            {line.label}={line.value}
          </span>
          <span className="ml-auto text-[10px] uppercase tracking-wide opacity-80">hidden</span>
        </div>
      )
    case 'button':
      return (
        <div
          className={cn(
            'inline-flex w-fit items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold',
            line.danger
              ? 'bg-rose-500 text-white'
              : 'bg-white/10 text-slate-200',
          )}
        >
          <CreditCard className="size-3.5" />
          {line.label}
        </div>
      )
    case 'flash':
      return (
        <div className="flex items-center gap-2 rounded-md border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-200">
          <ShieldAlert className="size-4" />
          {line.value}
        </div>
      )
  }
}

function ImpactScene({
  visual,
  progress,
}: {
  visual: Extract<Visual, { kind: 'impact' }>
  progress: number
}) {
  const flash = progress < 0.35
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 px-8 text-center">
      {flash && <div className="flash-impact pointer-events-none absolute inset-0 bg-rose-500/30" />}
      <h3 className="font-serif text-2xl text-white sm:text-3xl">{visual.heading}</h3>
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
        <span className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm text-slate-400 line-through">
          {visual.before}
        </span>
        <ArrowRight className="size-5 text-slate-500" />
        <span className="rounded-lg border border-rose-400/40 bg-rose-500/15 px-4 py-2 font-mono text-sm font-semibold text-rose-200">
          {visual.after}
        </span>
      </div>
      {visual.note && <p className="max-w-xl text-sm text-slate-300">{visual.note}</p>}
    </div>
  )
}
