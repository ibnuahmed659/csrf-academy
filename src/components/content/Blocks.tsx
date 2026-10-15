import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react'
import type { Block } from '@/content/chapters'
import { CodeBlock } from '@/components/ui/CodeBlock'
import { cn } from '@/lib/utils'

const calloutTone = {
  info: { cls: 'border-accent/30 bg-accent-soft', icon: Info, icon_cls: 'text-accent' },
  warn: { cls: 'border-warning/30 bg-warning-soft', icon: AlertTriangle, icon_cls: 'text-warning' },
  danger: { cls: 'border-danger/30 bg-danger-soft', icon: ShieldAlert, icon_cls: 'text-danger' },
  success: {
    cls: 'border-success/30 bg-success-soft',
    icon: CheckCircle2,
    icon_cls: 'text-success',
  },
} as const

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  )
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'p':
      return <p className="leading-relaxed text-muted">{block.text}</p>
    case 'h2':
      return (
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-ink">{block.text}</h2>
      )
    case 'ul':
      return (
        <ul className="flex flex-col gap-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-muted">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol className="flex flex-col gap-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-muted">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-[11px] font-bold text-brand">
                {i + 1}
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
      )
    case 'code':
      return <CodeBlock code={block.code} lang={block.lang} title={block.title} />
    case 'callout': {
      const tone = calloutTone[block.tone]
      const Icon = tone.icon
      return (
        <div className={cn('flex gap-3 rounded-lg border p-4', tone.cls)}>
          <Icon className={cn('mt-0.5 size-5 shrink-0', tone.icon_cls)} />
          <div className="flex flex-col gap-1">
            {block.title && <p className="text-sm font-semibold text-ink">{block.title}</p>}
            <p className="text-sm leading-relaxed text-muted">{block.text}</p>
          </div>
        </div>
      )
    }
    case 'steps':
      return (
        <ol className="flex flex-col gap-4">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-4">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ff5b2e] to-[#ffb020] text-[12px] font-bold text-[#170b06]">
                {i + 1}
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="text-sm leading-relaxed text-muted">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      )
  }
}
