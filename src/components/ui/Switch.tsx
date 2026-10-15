import { cn } from '@/lib/utils'

export interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  id?: string
  disabled?: boolean
}

export function Switch({ checked, onCheckedChange, label, id, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50',
        checked ? 'bg-brand' : 'bg-surface-3 ring-1 ring-inset ring-line-strong',
      )}
    >
      <span
        className={cn(
          'inline-block size-[1.125rem] rounded-full bg-white shadow transition-transform duration-200',
          checked ? 'translate-x-[1.45rem]' : 'translate-x-[0.2rem]',
        )}
      />
    </button>
  )
}
