import { useId } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

/** The ember forge mark: a shield with a request arrow slipping through it. */
export function Logomark({ className }: { className?: string }) {
  const id = useId()
  const gid = `${id}-g`
  return (
    <span
      className={cn(
        'relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[9px] shadow-soft',
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 64 64" className="size-full">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff5b2e" />
            <stop offset="0.55" stopColor="#ff7a4d" />
            <stop offset="1" stopColor="#ffb020" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill={`url(#${gid})`} />
        <path
          d="M32 10 L51 16.5 V31 C51 43.5 43 50.5 32 55 C21 50.5 13 43.5 13 31 V16.5 Z"
          fill="none"
          stroke="#140a05"
          strokeWidth="3.6"
          strokeLinejoin="round"
          opacity="0.9"
        />
        <path
          d="M22 42 L42 22"
          stroke="#140a05"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M34 22 H42 V30"
          fill="none"
          stroke="#140a05"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      </svg>
    </span>
  )
}

export function Logo({
  className,
  to = '/',
  showWordmark = true,
}: {
  className?: string
  to?: string
  showWordmark?: boolean
}) {
  return (
    <Link
      to={to}
      aria-label="CSRF Forge — home"
      className={cn('group inline-flex items-center gap-2.5', className)}
    >
      <Logomark className="size-8 transition-transform duration-300 ease-[var(--ease-forge)] group-hover:-rotate-6" />
      {showWordmark && (
        <span className="text-[16px] font-extrabold tracking-tight">
          <span className="text-ink">CSRF</span>
          <span className="text-ember">Forge</span>
        </span>
      )}
    </Link>
  )
}
