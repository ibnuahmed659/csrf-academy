import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { LAB_BY_ID, LAB_SCENARIOS, STAGE_LABEL } from '@/lib/lab'
import { useProgress } from '@/lib/progress'
import { LabWorkspace } from '@/components/lab/LabWorkspace'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import NotFound from './NotFound'

export default function Lab() {
  const { id } = useParams()
  const scenario = id ? LAB_BY_ID[id] : undefined
  const { isLabSolved } = useProgress()

  if (!scenario) return <NotFound />

  const index = LAB_SCENARIOS.findIndex((s) => s.id === scenario.id)
  const next = LAB_SCENARIOS[index + 1]
  const solved = isLabSolved(scenario.id)

  return (
    <div className="container-page py-8">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Link
          to="/labs"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5')}
        >
          <ArrowLeft className="size-4" /> All labs
        </Link>
        <Badge tone={scenario.mode === 'exploit' ? 'danger' : 'accent'}>
          {scenario.mode === 'exploit' ? 'Exploit' : 'Assess'}
        </Badge>
        <Badge tone="neutral">{STAGE_LABEL[scenario.stage]}</Badge>
        <Badge tone="neutral">{scenario.category}</Badge>
        {solved && (
          <Badge tone="success">
            <Check className="size-3" /> Solved
          </Badge>
        )}
      </div>

      <header className="mb-6 max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {scenario.title}
        </h1>
        <p className="mt-2 text-muted">{scenario.summary}</p>
      </header>

      <LabWorkspace key={scenario.id} scenario={scenario} />

      <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/labs"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'gap-1.5 self-start')}
        >
          <ArrowLeft className="size-4" /> All labs
        </Link>
        {next && (
          <Link
            to={`/labs/${next.id}`}
            className={cn(
              buttonVariants({ variant: 'secondary', size: 'sm' }),
              'min-w-0 gap-1.5 whitespace-normal text-left',
            )}
          >
            <span className="truncate">Next: {next.title}</span>
            <ArrowRight className="size-4 shrink-0" />
          </Link>
        )}
      </div>
    </div>
  )
}
