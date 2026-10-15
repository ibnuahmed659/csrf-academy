import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/Button'
import { Logomark } from '@/components/layout/Logo'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center">
      <Logomark className="size-14" />
      <div className="flex flex-col gap-2">
        <p className="font-mono text-sm text-brand">404</p>
        <h1 className="text-3xl font-bold text-ink">This page forged itself</h1>
        <p className="max-w-md text-muted">
          We couldn’t find what you were looking for. Maybe the request was cross-site.
        </p>
      </div>
      <Link to="/" className={cn(buttonVariants({ variant: 'forge', size: 'lg' }))}>
        Back to safety
      </Link>
    </div>
  )
}
