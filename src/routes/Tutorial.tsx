import { ArrowLeft, ArrowRight, Check, Lightbulb } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { TUTORIALS, TUTORIAL_BY_ID } from '@/lib/tutorial/tutorials'
import { LEVEL_LABEL } from '@/lib/tutorial/types'
import { useProgress } from '@/lib/progress'
import { TutorialPlayer } from '@/components/tutorial/TutorialPlayer'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonVariants } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import NotFound from './NotFound'

export default function Tutorial() {
  const { id } = useParams()
  const tutorial = id ? TUTORIAL_BY_ID[id] : undefined
  const { markTutorialWatched, isTutorialWatched } = useProgress()

  if (!tutorial) return <NotFound />

  const index = TUTORIALS.findIndex((t) => t.id === tutorial.id)
  const next = TUTORIALS[index + 1]
  const watched = isTutorialWatched(tutorial.id)

  return (
    <div className="container-page py-8">
      <div className="mb-5 flex items-center gap-3">
        <Link
          to="/tutorials"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5')}
        >
          <ArrowLeft className="size-4" /> All tutorials
        </Link>
        <Badge tone="brand">{tutorial.category}</Badge>
        <Badge tone="accent">{LEVEL_LABEL[tutorial.level]}</Badge>
        {watched && (
          <Badge tone="success">
            <Check className="size-3" /> Watched
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {tutorial.title}
            </h1>
            <p className="mt-1 text-muted">{tutorial.subtitle}</p>
          </div>

          <TutorialPlayer
            tutorial={tutorial}
            onComplete={() => markTutorialWatched(tutorial.id)}
          />

          <Card className="p-5">
            <p className="text-sm leading-relaxed text-muted">{tutorial.summary}</p>
          </Card>
        </div>

        <aside className="flex flex-col gap-5">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-4 text-warning" />
              <h2 className="text-sm font-semibold text-ink">Key points</h2>
            </div>
            <ul className="mt-3 flex flex-col gap-3">
              {tutorial.keyPoints.map((k, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-muted">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  {k}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Scenes</h2>
            <ol className="mt-3 flex flex-col gap-2">
              {tutorial.scenes.map((s, i) => (
                <li key={s.id} className="flex items-baseline gap-2 text-sm text-muted">
                  <span className="font-mono text-[11px] text-faint">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {s.title}
                </li>
              ))}
            </ol>
          </Card>

          <div className="flex flex-col gap-3">
            {next ? (
              <Link
                to={`/tutorials/${next.id}`}
                className={cn(
                  buttonVariants({ variant: 'forge', size: 'lg' }),
                  'justify-between whitespace-normal text-left',
                )}
              >
                <span className="text-left">
                  <span className="block text-[11px] font-normal opacity-80">Next</span>
                  {next.title}
                </span>
                <ArrowRight className="size-4 shrink-0" />
              </Link>
            ) : (
              <Link
                to="/labs"
                className={cn(buttonVariants({ variant: 'forge', size: 'lg' }), 'justify-between')}
              >
                You’ve watched them all — try a lab
                <ArrowRight className="size-4" />
              </Link>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => markTutorialWatched(tutorial.id)}
            >
              Mark as watched
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
