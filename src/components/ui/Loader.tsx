import { Loader2 } from 'lucide-react'

export function Loader() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center gap-3 text-muted">
        <Loader2 className="size-6 animate-spin text-brand" />
        <p className="text-sm">Firing up the forge…</p>
      </div>
    </div>
  )
}
