import { ArrowLeft, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { CartoonPlayer } from '@/components/cartoon/CartoonPlayer'
import { CartoonQuiz } from '@/components/cartoon/CartoonQuiz'
import { Accordion } from '@/components/ui/Accordion'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { cartoons, getCartoon } from '@/content/cartoon'
import { getQuiz } from '@/content/cartoon/quiz'
import { decodeEntities } from '@/lib/cartoon/text'
import { useProgress } from '@/lib/progress'
import { cn } from '@/lib/utils'
import NotFound from '@/routes/NotFound'

export default function CartoonEpisode() {
  const { id } = useParams()
  const cartoon = id ? getCartoon(id) : undefined
  const { isCartoonWatched, isQuizPassed } = useProgress()

  if (!cartoon) return <NotFound />

  const seriesList = cartoons.filter((c) => c.series === cartoon.series)
  const posInSeries = seriesList.findIndex((c) => c.id === cartoon.id)
  const prev = seriesList[posInSeries - 1]
  const next = seriesList[posInSeries + 1]
  const quiz = getQuiz(cartoon.id)

  const watched = isCartoonWatched(cartoon.id)
  const quizDone = isQuizPassed(cartoon.id)

  const transcriptItems = [
    {
      id: 'transcript',
      title: `Transcript · ${cartoon.scenes.length} scenes`,
      content: (
        <ol className="grid gap-3">
          {cartoon.scenes.map((s, i) => (
            <li key={s.id} className="text-sm">
              <span className="mr-2 font-mono text-[11px] text-faint">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-semibold text-ink">{s.title}</span>
              <p className="mt-0.5 pl-7 text-muted">{decodeEntities(s.caption)}</p>
            </li>
          ))}
        </ol>
      ),
    },
  ]

  return (
    <div className="container-page py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/cartoons"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5')}
          >
            <ArrowLeft className="size-4" />
            All CSRF cartoons
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {watched && (
              <Badge tone="success">
                <Check className="size-3" /> Watched
              </Badge>
            )}
            {quizDone && (
              <Badge tone="success">
                <Check className="size-3" /> Quiz passed
              </Badge>
            )}
            <Badge tone="brand">
              {cartoon.series} · Episode {cartoon.number} of {seriesList.length}
            </Badge>
          </div>
        </div>

        <header className="rounded-2xl border border-line bg-surface p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">{cartoon.series}</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{cartoon.title}</h1>
          <p className="mt-1 text-sm font-medium text-muted">{cartoon.subtitle}</p>
          <p className="mt-3 max-w-3xl text-sm text-muted">{cartoon.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-faint">
            {cartoon.tags.map((t) => (
              <span key={t} className="rounded-full border border-line px-3 py-1">
                {t}
              </span>
            ))}
          </div>
        </header>

        <CartoonPlayer
          key={cartoon.id}
          cartoon={cartoon}
          next={next ? { id: next.id, title: next.title, series: next.series, number: next.number } : undefined}
        />

        <Accordion items={transcriptItems} />

        {quiz && <CartoonQuiz id={cartoon.id} quiz={quiz} />}

        <nav className="flex flex-wrap items-center justify-between gap-3">
          {prev ? (
            <Link
              to={`/cartoons/${prev.id}`}
              className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm hover:border-line-strong hover:bg-surface-2"
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">
                Ep {prev.number}: {prev.title}
              </span>
              <span className="sm:hidden">Previous</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to={`/cartoons/${next.id}`}
              className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm hover:border-line-strong hover:bg-surface-2"
            >
              <span className="hidden sm:inline">
                Ep {next.number}: {next.title}
              </span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </div>
  )
}
