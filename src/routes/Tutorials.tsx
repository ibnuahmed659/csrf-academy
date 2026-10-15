import { Clapperboard, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TUTORIALS } from '@/lib/tutorial/tutorials'
import { formatTime, LEVEL_LABEL, tutorialDuration } from '@/lib/tutorial/types'
import { useProgress } from '@/lib/progress'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function Tutorials() {
  const { isTutorialWatched } = useProgress()

  return (
    <div className="container-page py-10">
      <header className="mb-8 flex flex-col gap-3">
        <Badge tone="brand">
          <Clapperboard className="size-3" /> Video Tutorials
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Learn CSRF like you’re watching a video
        </h1>
        <p className="max-w-2xl text-muted">
          Animated, narrated walkthroughs you can scrub, pause and slow down. Each one
          builds from a single idea to a real attack or defense.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {TUTORIALS.map((t) => {
          const watched = isTutorialWatched(t.id)
          return (
            <Link
              key={t.id}
              to={`/tutorials/${t.id}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-soft transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-card"
            >
              <div className="stage-grid relative aspect-video overflow-hidden bg-[#0a0b10]">
                <div className="stage-vignette absolute inset-0" />
                <div className="absolute inset-0 flex flex-col items-start justify-between p-4">
                  <div className="flex w-full items-center justify-between">
                    <Badge tone="neutral" className="backdrop-blur-sm">
                      {t.category}
                    </Badge>
                    {watched && (
                      <Badge tone="success" className="backdrop-blur-sm">
                        Watched
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="font-serif text-xl leading-tight text-white sm:text-2xl">
                      {t.title}
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className="rounded-full bg-black/60 px-2 py-0.5 font-mono text-[11px] text-slate-300 backdrop-blur-sm">
                    {formatTime(tutorialDuration(t))}
                  </span>
                  <span className="grid size-9 place-items-center rounded-full bg-white/90 text-[#170b06] transition group-hover:scale-105">
                    <Play className="size-4 translate-x-0.5 fill-current" />
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <p className="text-sm font-medium text-ink">{t.subtitle}</p>
                <p className="text-sm leading-relaxed text-muted">{t.summary}</p>
                <div className="mt-auto flex items-center gap-2">
                  <Badge tone="accent">{LEVEL_LABEL[t.level]}</Badge>
                  <span className="text-[12px] text-faint">
                    {t.scenes.length} scenes
                  </span>
                  <span
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'sm' }),
                      'ml-auto text-brand',
                    )}
                  >
                    Watch
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
