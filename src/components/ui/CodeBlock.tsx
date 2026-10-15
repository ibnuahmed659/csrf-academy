import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCopy } from '@/lib/hooks'

export interface CodeBlockProps {
  code: string
  lang?: string
  title?: string
  className?: string
  wrap?: boolean
}

export function CodeBlock({ code, lang, title, className, wrap }: CodeBlockProps) {
  const { copied, copy } = useCopy()
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border border-code-line bg-code',
        className,
      )}
    >
      {(title || lang) && (
        <div className="flex items-center justify-between border-b border-code-line px-3 py-1.5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-code-fg/50">
            {title ?? lang}
          </span>
          <button
            type="button"
            onClick={() => copy(code)}
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-code-fg/60 transition hover:bg-white/10 hover:text-code-fg"
            aria-label="Copy code"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
      <pre
        className={cn(
          'overflow-x-auto p-3.5 text-[12.5px] leading-relaxed text-code-fg',
          wrap && 'whitespace-pre-wrap break-all',
        )}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}
