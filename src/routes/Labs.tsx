import { Beaker, Check, Flag, Lock, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LAB_SCENARIOS, STAGE_LABEL, STAGE_ORDER } from '@/lib/lab'
import { useProgress } from '@/lib/progress'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/utils'

export default function Labs() {
  const { isLabSolved } = useProgress()
  const solvedCount = LAB_SCENARIOS.filter((s) => isLabSolved(s.id)).length

  return (
    <div className="container-page py-10">
      <header className="mb-8 flex flex-col gap-4">
        <Badge tone="danger" className="w-fit">
          <Beaker className="size-3" /> Lab-yada Weerarka
        </Badge>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Samee codsiyo dhab ah
            </h1>
            <p className="mt-2 max-w-2xl text-muted">
              Lab kastaa waa bartilmaameed nool. Samee weerarka, fiirso tallaabo kasta,
              dabadeed beddel difaacyada oo jabi weerarkaaga.
            </p>
          </div>
          <div className="w-full max-w-xs">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-muted">La xalliyay</span>
              <span className="font-semibold text-ink">
                {solvedCount} / {LAB_SCENARIOS.length}
              </span>
            </div>
            <Progress value={solvedCount} max={LAB_SCENARIOS.length} />
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-10">
        {STAGE_ORDER.map((stage) => {
          const labs = LAB_SCENARIOS.filter((s) => s.stage === stage)
          if (labs.length === 0) return null
          return (
            <section key={stage} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-ink">{STAGE_LABEL[stage]}</h2>
                <span className="h-px flex-1 bg-line" />
                <span className="text-sm text-faint">{labs.length} lab</span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {labs.map((lab) => {
                  const solved = isLabSolved(lab.id)
                  return (
                    <Link
                      key={lab.id}
                      to={`/labs/${lab.id}`}
                      className={cn(
                        'group flex flex-col gap-3 rounded-xl border bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card',
                        solved ? 'border-success/40' : 'border-line hover:border-line-strong',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Badge tone={lab.mode === 'exploit' ? 'danger' : 'accent'}>
                          {lab.mode === 'exploit' ? (
                            <>
                              <ShieldAlert className="size-3" /> Weerar
                            </>
                          ) : (
                            <>
                              <Lock className="size-3" /> Demaamil
                            </>
                          )}
                        </Badge>
                        <span className="text-[11px] font-medium uppercase tracking-wide text-faint">
                          {lab.category}
                        </span>
                        {solved && (
                          <span className="ml-auto grid size-6 place-items-center rounded-full bg-success-soft text-success">
                            <Check className="size-3.5" />
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-ink">{lab.title}</h3>
                      <p className="line-clamp-3 text-sm leading-relaxed text-muted">
                        {lab.summary}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-brand">
                        <Flag className="size-3.5" />
                        Fur lab-ka
                      </span>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
