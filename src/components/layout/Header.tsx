import { Menu, Moon, Sun, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { NAV } from '@/lib/site'
import { useTheme } from '@/lib/theme'
import { Button, buttonVariants } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function Header() {
  const { theme, toggle } = useTheme()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="grid size-10 place-items-center rounded-md text-muted transition hover:bg-surface-2 hover:text-ink lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <Logo />

        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((item) => {
            const active = item.match ? item.match(pathname) : pathname === item.to
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'relative rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'text-ink' : 'text-muted hover:text-ink',
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-2.5 -bottom-[0.5px] h-0.5 rounded-full bg-brand" />
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </Button>
          <Link
            to="/labs"
            className={cn(buttonVariants({ variant: 'forge', size: 'sm' }), 'hidden sm:inline-flex')}
          >
            Start a lab
          </Link>
        </div>
      </div>

      {open &&
        createPortal(<MobileNav pathname={pathname} onClose={() => setOpen(false)} />, document.body)}
    </header>
  )
}

function MobileNav({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 w-72 max-w-[82vw] overflow-y-auto border-r border-line bg-canvas p-4 shadow-pop">
        <div className="flex items-center justify-between">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="grid size-9 place-items-center rounded-md text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map((item) => {
            const active = item.match ? item.match(pathname) : pathname === item.to
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-soft text-brand'
                    : 'text-muted hover:bg-surface-2 hover:text-ink',
                )}
              >
                <Icon className="size-[18px] shrink-0" />
                <span className="flex flex-col">
                  {item.label}
                  {item.description && (
                    <span className="text-[11px] font-normal text-faint">{item.description}</span>
                  )}
                </span>
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
