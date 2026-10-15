import { ChevronDown } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type AccordionItem = {
  id: string
  title: string
  content: ReactNode
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null)

  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
      {items.map((item) => {
        const isOpen = open === item.id
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
            >
              {item.title}
              <ChevronDown
                className={cn('size-4 shrink-0 text-faint transition-transform', isOpen && 'rotate-180')}
              />
            </button>
            {isOpen && <div className="px-5 pb-5">{item.content}</div>}
          </div>
        )
      })}
    </div>
  )
}
