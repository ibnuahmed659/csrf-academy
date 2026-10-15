import { BookOpen, Check, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CHAPTERS } from '@/content/chapters'
import { useProgress } from '@/lib/progress'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/utils'

export default function Learn() {
  const { isChapterDone } = useProgress()
  const done = CHAPTERS.filter((c) => isChapterDone(c.slug)).length

  return (
    <div className="container-page py-10">
      <header className="mb-8 flex flex-col gap-4">
        <Badge tone="brand" className="w-fit">
          <BookOpen className="size-3" /> Chapters
        </Badge>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              The CSRF handbook
            </h1>
            <p className="mt-2 max-w-2xl text-muted">
              The concepts behind the labs: how the forgery works, the defenses that stop
              it, and how to test for it responsibly.
            </p>
          </div>
          <div className="w-full max-w-xs">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted">Completed</span>
              <span className="font-semibold text-ink">
                {done} / {CHAPTERS.length}
              </span>
            </div>
            <Progress value={done} max={CHAPTERS.length} tone="success" />
          </div>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {CHAPTERS.map((c, i) => {
          const complete = isChapterDone(c.slug)
          return (
            <Link
              key={c.slug}
              to={`/learn/${c.slug}`}
              className={cn(
                'group flex gap-4 rounded-xl border bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card',
                complete ? 'border-success/40' : 'border-line hover:border-line-strong',
              )}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-surface-2 font-mono text-sm font-bold text-brand">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex flex-1 flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-ink">{c.title}</h2>
                  {complete && (
                    <span className="ml-auto grid size-6 place-items-center rounded-full bg-success-soft text-success">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted">{c.subtitle}</p>
                <div className="mt-1 flex items-center gap-3 text-[12px] text-faint">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" /> {c.minutes} min
                  </span>
                  <Badge tone="neutral" className="capitalize">
                    {c.level}
                  </Badge>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
