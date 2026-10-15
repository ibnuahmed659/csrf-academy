import { CheckCircle2, Clapperboard, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CartoonSeriesGroup } from '@/content/cartoon'
import { useProgress } from '@/lib/progress'

export function CartoonLibrary({
  kicker,
  heading,
  description,
  series,
}: {
  kicker: string
  heading: string
  description: string
  series: CartoonSeriesGroup[]
}) {
  const { watchedCartoons, passedQuizzes } = useProgress()
  const watched = new Set(watchedCartoons)
  const passed = new Set(passedQuizzes)

  const all = series.flatMap((g) => g.cartoons)
  const total = all.length
  const watchedCount = all.filter((c) => watched.has(c.id)).length
  const passedCount = all.filter((c) => passed.has(c.id)).length
  const percent = total ? Math.round((watchedCount / total) * 100) : 0

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <header className="overflow-hidden rounded-2xl border border-line bg-surface p-6">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand">
          <Clapperboard className="size-4" />
          {kicker}
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{heading}</h1>
        <p className="mt-3 max-w-3xl text-sm text-muted">{description}</p>

        <div className="mt-5 max-w-md">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-muted">
              {series.length} series · {total} episodes
            </span>
            <span className="font-semibold text-ink">
              {watchedCount} / {total} watched · {passedCount} quizzes passed
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-3">
            <div
              className="h-full rounded-full bg-brand transition-[width] duration-500"
              style={{ width: `${percent}%` }}
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </header>

      {series.map((group) => {
        const done = group.cartoons.filter((c) => watched.has(c.id)).length
        return (
          <section key={group.name} className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold">{group.name}</h2>
              <span className="rounded-full border border-line px-2.5 py-0.5 text-[11px] text-faint">
                {group.cartoons.length}{' '}
                {group.cartoons.length === 1 ? 'episode' : 'episodes'}
              </span>
              {done > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-0.5 text-[11px] font-bold text-success">
                  <CheckCircle2 className="size-3" /> {done}/{group.cartoons.length} watched
                </span>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.cartoons.map((c) => {
                const isWatched = watched.has(c.id)
                const isPassed = passed.has(c.id)
                return (
                  <Link
                    key={c.id}
                    to={`/cartoons/${c.id}`}
                    className="group flex flex-col rounded-2xl border border-line bg-surface p-5 transition hover:border-brand/60 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand">
                        Episode {c.number}
                      </span>
                      {isWatched ? (
                        <CheckCircle2 className="size-5 text-success" />
                      ) : (
                        <Play className="size-5 text-faint transition group-hover:text-brand" />
                      )}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold">{c.title}</h3>
                    <p className="mt-1 text-sm font-medium text-muted">{c.subtitle}</p>
                    <p className="mt-2 flex-1 text-sm text-faint">{c.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {c.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-line px-2.5 py-0.5 text-[11px] text-faint"
                        >
                          {t}
                        </span>
                      ))}
                      {isPassed && (
                        <span className="rounded-full bg-success-soft px-2.5 py-0.5 text-[11px] font-bold text-success">
                          Quiz passed
                        </span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
