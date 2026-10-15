import { Link } from 'react-router-dom'
import { Logomark } from './Logo'
import { NAV, SOCIALS } from '@/lib/site'

const YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-canvas-2">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <Logomark className="size-9" />
            <span className="text-[16px] font-extrabold tracking-tight">
              <span className="text-ink">CSRF</span>
              <span className="text-ember">Forge</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-muted">
            Forge the request. Break the trust. A hands-on academy for understanding
            Cross-Site Request Forgery — from the shape of a forged request to the
            defenses that stop it.
          </p>
          <ul className="mt-5 flex flex-wrap items-center gap-2">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`${s.label} ${s.handle}`}
                  title={`${s.label} · ${s.handle}`}
                  className="grid size-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-line-strong hover:bg-surface-2 hover:text-ink"
                >
                  <s.Icon className="size-[18px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-faint">
            Academy
          </h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-sm text-muted transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-faint">
            Ethics
          </h3>
          <p className="mt-4 text-sm text-muted">
            Everything here runs locally in your browser against simulated targets.
            Use these techniques only on systems you own or are explicitly authorized
            to test.
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-5 text-xs text-faint sm:flex-row sm:items-center">
          <p>© {YEAR} CSRF Forge · Built for education and ethical security research.</p>
          <p className="font-mono">No accounts · progress stored locally</p>
        </div>
      </div>
    </footer>
  )
}
