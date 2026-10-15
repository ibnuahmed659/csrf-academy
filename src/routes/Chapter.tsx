import { ArrowLeft, ArrowRight, Check, Clock } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CHAPTER_BY_SLUG, CHAPTERS } from '@/content/chapters'
import { useProgress } from '@/lib/progress'
import { Blocks } from '@/components/content/Blocks'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import NotFound from './NotFound'

export default function Chapter() {
  const { slug } = useParams()
  const chapter = slug ? CHAPTER_BY_SLUG[slug] : undefined
  const { isChapterDone, markChapterDone, toggleChapter } = useProgress()

  useEffect(() => {
    if (chapter) document.title = `${chapter.title} — CSRF Forge`
    return () => {
      document.title = 'CSRF Forge — Master Cross-Site Request Forgery'
    }
  }, [chapter])

  if (!chapter) return <NotFound />

  const index = CHAPTERS.findIndex((c) => c.slug === chapter.slug)
  const prev = CHAPTERS[index - 1]
  const next = CHAPTERS[index + 1]
  const complete = isChapterDone(chapter.slug)

  return (
    <div className="container-page py-8">
      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 flex flex-col gap-1">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-faint">
              Chapters
            </p>
            {CHAPTERS.map((c, i) => {
              const active = c.slug === chapter.slug
              return (
                <Link
                  key={c.slug}
                  to={`/learn/${c.slug}`}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors',
                    active
                      ? 'bg-brand-soft font-medium text-brand'
                      : 'text-muted hover:bg-surface-2 hover:text-ink',
                  )}
                >
                  <span className="font-mono text-[11px] text-faint">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="truncate">{c.title}</span>
                </Link>
              )
            })}
          </div>
        </aside>

        <article className="min-w-0 max-w-3xl">
          <Link
            to="/learn"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5 lg:hidden')}
          >
            <ArrowLeft className="size-4" /> Chapters
          </Link>

          <header className="mt-4 flex flex-col gap-3 lg:mt-0">
            <div className="flex items-center gap-3">
              <Badge tone="brand" className="capitalize">
                {chapter.level}
              </Badge>
              <span className="inline-flex items-center gap-1 text-[13px] text-faint">
                <Clock className="size-3.5" /> {chapter.minutes} min read
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-ink">{chapter.title}</h1>
            <p className="text-lg text-muted">{chapter.subtitle}</p>
          </header>

          <div className="mt-8">
            <Blocks blocks={chapter.blocks} />
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
            <Button
              variant={complete ? 'success' : 'primary'}
              onClick={() => toggleChapter(chapter.slug)}
            >
              {complete && <Check className="size-4" />}
              {complete ? 'Completed' : 'Mark as complete'}
            </Button>
            {prev && (
              <Link
                to={`/learn/${prev.slug}`}
                className={cn(buttonVariants({ variant: 'ghost', size: 'md' }), 'gap-1.5')}
              >
                <ArrowLeft className="size-4" /> {prev.title}
              </Link>
            )}
            {next && (
              <Link
                to={`/learn/${next.slug}`}
                className={cn(
                  buttonVariants({ variant: 'secondary', size: 'md' }),
                  'ml-auto max-w-full gap-1.5 whitespace-normal text-left',
                )}
                onClick={() => markChapterDone(chapter.slug)}
              >
                {next.title} <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}
