import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'forge'

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-md whitespace-nowrap ' +
  'transition-[color,background-color,border-color,box-shadow,transform,filter,opacity] duration-150 ' +
  'ease-[var(--ease-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-brand disabled:opacity-50 disabled:pointer-events-none ' +
  'select-none active:translate-y-px'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-brand-fg hover:bg-brand-hover shadow-soft',
  secondary:
    'bg-surface-2 text-ink border border-line hover:border-line-strong hover:bg-surface-3',
  outline: 'border border-line-strong bg-transparent text-ink hover:bg-surface-2',
  ghost: 'text-muted hover:text-ink hover:bg-surface-2',
  danger: 'bg-danger text-white hover:brightness-110 dark:text-[#1b0a0f]',
  success: 'bg-success text-white hover:brightness-110 dark:text-[#04160d]',
  forge:
    'bg-gradient-to-r from-[#ff5b2e] to-[#ffb020] text-[#170b06] shadow-soft hover:brightness-105',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-[15px]',
  icon: 'h-10 w-10',
  'icon-sm': 'h-8 w-8',
}

export function buttonVariants(options?: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}) {
  const { variant = 'primary', size = 'md', className } = options ?? {}
  return cn(base, variants[variant], sizes[size], className)
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', loading, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
})
