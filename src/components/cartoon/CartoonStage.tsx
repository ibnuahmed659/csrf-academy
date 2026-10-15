import type { CartoonEffect, CartoonScene } from '@/lib/cartoon/types'
import { Character } from './characters'

const W = 1000
const H = 620

const HEAD_OFFSET: Record<string, number> = {
  hacker: 36,
  victim: 36,
  defender: 36,
  server: 34,
  browser: 40,
  cloud: 22,
}

function Background({ kind }: { kind: string }) {
  if (kind === 'city') {
    return (
      <g>
        <rect x={0} y={0} width={W} height={H} fill="url(#skyCity)" />
        <g fill="#e0e7ff" opacity={0.8}>
          <circle cx={130} cy={70} r={1.6} />
          <circle cx={260} cy={140} r={1.4} />
          <circle cx={420} cy={60} r={1.8} />
          <circle cx={560} cy={120} r={1.4} />
          <circle cx={700} cy={70} r={1.6} />
          <circle cx={930} cy={150} r={1.5} />
        </g>
        <circle cx={850} cy={96} r={46} fill="#fde68a" opacity={0.18} />
        <circle cx={850} cy={96} r={34} fill="#fde68a" opacity={0.95} />
        <g>
          <rect x={20} y={300} width={120} height={320} fill="url(#bldA)" />
          <rect x={160} y={210} width={140} height={410} fill="url(#bldB)" />
          <rect x={320} y={330} width={110} height={290} fill="url(#bldA)" />
          <rect x={450} y={250} width={130} height={370} fill="url(#bldB)" />
          <rect x={600} y={310} width={110} height={310} fill="url(#bldA)" />
          <rect x={730} y={230} width={140} height={390} fill="url(#bldB)" />
          <rect x={890} y={320} width={100} height={300} fill="url(#bldA)" />
        </g>
        <g fill="#fbbf24" opacity={0.55}>
          <rect x={190} y={250} width={16} height={22} />
          <rect x={230} y={250} width={16} height={22} />
          <rect x={270} y={250} width={16} height={22} />
          <rect x={200} y={300} width={16} height={20} />
          <rect x={480} y={285} width={16} height={20} />
          <rect x={520} y={290} width={16} height={20} />
          <rect x={480} y={340} width={16} height={20} />
          <rect x={630} y={350} width={16} height={20} />
          <rect x={660} y={390} width={16} height={20} />
          <rect x={770} y={280} width={18} height={22} />
          <rect x={820} y={320} width={18} height={22} />
          <rect x={770} y={360} width={18} height={22} />
        </g>
        <rect x={0} y={H - 70} width={W} height={70} fill="url(#floorCity)" />
        <rect x={0} y={H - 70} width={W} height={3} fill="rgba(148,163,184,0.25)" />
      </g>
    )
  }
  if (kind === 'room') {
    return (
      <g>
        <rect x={0} y={0} width={W} height={H} fill="url(#wallRoom)" />
        <path d="M0 0 L520 0 L440 500 L0 500 Z" fill="rgba(255,255,255,0.05)" />
        <rect x={0} y={H - 130} width={W} height={130} fill="url(#floorWood)" />
        <g stroke="rgba(0,0,0,0.25)" strokeWidth={2}>
          <line x1={0} y1={H - 130} x2={W} y2={H - 130} />
          <line x1={180} y1={H - 130} x2={120} y2={H} />
          <line x1={480} y1={H - 130} x2={450} y2={H} />
          <line x1={780} y1={H - 130} x2={810} y2={H} />
        </g>
        <g>
          <rect x={640} y={70} width={300} height={210} rx={12} fill="#050a18" stroke="#1e293b" strokeWidth={7} />
          <rect x={656} y={86} width={130} height={178} fill="url(#skyCity)" opacity={0.9} />
          <rect x={798} y={86} width={126} height={178} fill="url(#skyCity)" opacity={0.9} />
          <rect x={640} y={70} width={300} height={210} rx={12} fill="none" stroke="rgba(148,163,184,0.35)" strokeWidth={2} />
          <line x1={790} y1={70} x2={790} y2={280} stroke="#1e293b" strokeWidth={6} />
        </g>
        <rect x={70} y={344} width={380} height={26} rx={7} fill="url(#desk)" />
        <rect x={92} y={370} width={22} height={150} fill="#5b3416" />
        <rect x={406} y={370} width={22} height={150} fill="#5b3416" />
        <g>
          <path d="M420 344 L470 344 L462 300 Q445 288 428 300 Z" fill="#1f2937" />
          <path d="M432 300 Q445 258 458 300" fill="#0ea5e9" opacity={0.75} />
        </g>
      </g>
    )
  }
  if (kind === 'server-room') {
    return (
      <g>
        <rect x={0} y={0} width={W} height={H} fill="url(#serverBg)" />
        <path d="M380 0 L620 0 L720 500 L280 500 Z" fill="rgba(56,189,248,0.06)" />
        <g fill="url(#rack)" stroke="rgba(148,163,184,0.22)" strokeWidth={2}>
          <rect x={20} y={110} width={92} height={440} rx={8} />
          <rect x={128} y={150} width={92} height={400} rx={8} />
          <rect x={780} y={110} width={92} height={440} rx={8} />
          <rect x={888} y={150} width={92} height={400} rx={8} />
        </g>
        <g className="cc-leds">
          <circle cx={50} cy={140} r={4} fill="#34d399" />
          <circle cx={70} cy={140} r={4} fill="#38bdf8" />
          <circle cx={50} cy={200} r={4} fill="#fbbf24" />
          <circle cx={160} cy={180} r={4} fill="#34d399" />
          <circle cx={180} cy={180} r={4} fill="#fb7185" />
          <circle cx={810} cy={140} r={4} fill="#34d399" />
          <circle cx={830} cy={140} r={4} fill="#38bdf8" />
          <circle cx={920} cy={180} r={4} fill="#fbbf24" />
        </g>
        <rect x={0} y={H - 60} width={W} height={60} fill="url(#floorGrid)" />
        <rect x={0} y={H - 60} width={W} height={2} fill="rgba(56,189,248,0.3)" />
      </g>
    )
  }
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="url(#serverBg)" />
      <circle cx={500} cy={310} r={260} fill="url(#webGlow)" />
      <g stroke="rgba(56,189,248,0.18)" strokeWidth={1.5}>
        {Array.from({ length: 13 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 80 + 40} y1={0} x2={i * 80 + 40} y2={H} />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 70 + 20} x2={W} y2={i * 70 + 20} />
        ))}
      </g>
      <g className="cc-nodes">
        <circle cx={220} cy={180} r={6} fill="#38bdf8" />
        <circle cx={520} cy={120} r={6} fill="#818cf8" />
        <circle cx={780} cy={220} r={6} fill="#38bdf8" />
        <circle cx={340} cy={400} r={6} fill="#818cf8" />
        <circle cx={700} cy={430} r={6} fill="#22d3ee" />
        <circle cx={500} cy={300} r={8} fill="#a5b4fc" />
      </g>
    </g>
  )
}

function ParticlesLayer() {
  const dots = [
    [12, 30], [22, 68], [33, 20], [41, 55], [52, 78], [61, 34], [70, 62],
    [79, 26], [88, 48], [15, 84], [28, 44], [46, 12], [58, 90], [67, 16],
    [74, 72], [83, 40], [93, 66], [8, 58],
  ]
  return (
    <>
      {dots.map(([x, y], i) => (
        <span
          key={i}
          className="cc-particle"
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i % 6) * 0.7}s`, animationDuration: `${6 + (i % 5)}s` }}
        />
      ))}
    </>
  )
}

function Effect({ effect }: { effect: CartoonEffect }) {
  const tone = effect.tone ?? 'brand'
  if (effect.kind === 'alert') {
    return (
      <div
        className="cc-alert"
        style={{ left: `${effect.to.x}%`, top: `${effect.to.y}%`, animationDelay: `${effect.delay ?? 0}ms` }}
      >
        <span className="cc-alert-bar">( ! )</span>
        <span>{effect.label ?? 'XSS'}</span>
      </div>
    )
  }
  if (effect.kind === 'glow') {
    return (
      <div
        className={`cc-glow cc-tone-${tone}`}
        style={{ left: `${effect.to.x}%`, top: `${effect.to.y}%`, animationDelay: `${effect.delay ?? 0}ms` }}
      />
    )
  }
  if (effect.kind === 'badge') {
    return (
      <div
        className={`cc-badge cc-tone-${tone}`}
        style={{ left: `${effect.to.x}%`, top: `${effect.to.y}%`, animationDelay: `${effect.delay ?? 0}ms` }}
      >
        {effect.label}
      </div>
    )
  }
  const from = effect.from ?? effect.to
  return (
    <div
      className={`cc-packet cc-tone-${tone}`}
      style={
        {
          '--fx': `${from.x}%`,
          '--fy': `${from.y}%`,
          '--tx': `${effect.to.x}%`,
          '--ty': `${effect.to.y}%`,
          animationDelay: `${effect.delay ?? 0}ms`,
          animationDuration: `${effect.duration ?? 1500}ms`,
        } as React.CSSProperties
      }
    >
      {effect.label && <span className="cc-packet-label">{effect.label}</span>}
    </div>
  )
}

export function CartoonStage({ scene }: { scene: CartoonScene }) {
  return (
    <div className="cc-stage">
      <svg key={scene.id} viewBox={`0 0 1000 620`} className="cc-svg cc-scene-in" preserveAspectRatio="xMidYMid slice" role="img" aria-label={scene.title}>
        <defs>
          <linearGradient id="skyCity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1030" />
            <stop offset="0.55" stopColor="#312e81" />
            <stop offset="1" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="serverBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#020617" />
            <stop offset="1" stopColor="#0b1220" />
          </linearGradient>
          <linearGradient id="wallRoom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b4a63" />
            <stop offset="1" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="floorWood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6b4423" />
            <stop offset="1" stopColor="#3f2a17" />
          </linearGradient>
          <linearGradient id="desk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8a5a2b" />
            <stop offset="1" stopColor="#5b3416" />
          </linearGradient>
          <linearGradient id="floorCity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1220" />
            <stop offset="1" stopColor="#05070d" />
          </linearGradient>
          <linearGradient id="floorGrid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1220" />
            <stop offset="1" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="bldA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#141f3a" />
            <stop offset="1" stopColor="#0b1220" />
          </linearGradient>
          <linearGradient id="bldB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1b2a4a" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="rack" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#111c33" />
            <stop offset="1" stopColor="#0a1120" />
          </linearGradient>
          <linearGradient id="sMetal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b4a63" />
            <stop offset="0.5" stopColor="#243047" />
            <stop offset="1" stopColor="#131c2e" />
          </linearGradient>
          <linearGradient id="glassWin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#16213a" />
            <stop offset="1" stopColor="#0b1220" />
          </linearGradient>
          <linearGradient id="cloudFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#334155" />
            <stop offset="1" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="gShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.32" />
          </linearGradient>
          <linearGradient id="hb-hacker" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6d28d9" />
            <stop offset="1" stopColor="#3730a3" />
          </linearGradient>
          <linearGradient id="hh-hacker" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4c1d95" />
            <stop offset="1" stopColor="#2e1065" />
          </linearGradient>
          <linearGradient id="hb-victim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="hh-victim" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0369a1" />
            <stop offset="1" stopColor="#075985" />
          </linearGradient>
          <linearGradient id="hb-defender" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#34d399" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="hh-defender" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#047857" />
            <stop offset="1" stopColor="#065f46" />
          </linearGradient>
          <radialGradient id="spot" cx="0.5" cy="0.05" r="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.14" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
            <stop offset="0.6" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.5" />
          </radialGradient>
          <radialGradient id="webGlow" cx="0.5" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#312e81" stopOpacity="0.6" />
            <stop offset="1" stopColor="#020617" stopOpacity="0" />
          </radialGradient>
        </defs>

        <Background kind={scene.background} />
        <rect x={0} y={0} width={1000} height={620} fill="url(#spot)" />

        {scene.actors.map((a) => (
          <g
            key={`${scene.id}-${a.id}`}
            transform={`translate(${(a.x / 100) * 1000} ${(a.y / 100) * 620}) scale(${a.scale ?? 1})`}
          >
            <Character kind={a.kind} state={a.state} />
            {a.name && (
              <text x={0} y={18} textAnchor="middle" fontSize={15} fontWeight={800} fill="#e2e8f0" fontFamily="ui-monospace, monospace" opacity={0.9}>
                {a.name}
              </text>
            )}
          </g>
        ))}

        <rect x={0} y={0} width={1000} height={620} fill="url(#vignette)" pointerEvents="none" />
      </svg>

      <ParticlesLayer />

      {scene.actors.map((a) =>
        a.speech ? (
          <div
            key={`sp-${scene.id}-${a.id}`}
            className="cc-bubble"
            style={{
              left: `${a.x}%`,
              top: `${a.y - (HEAD_OFFSET[a.kind] ?? 30)}%`,
              transform: `translate(${a.x > 62 ? '-94%' : a.x < 22 ? '-6%' : '-50%'}, -100%)`,
            }}
          >
            {a.name && <span className="cc-bubble-name">{a.name}</span>}
            <span>{a.speech}</span>
          </div>
        ) : null,
      )}

      {scene.effects?.map((e, i) => (
        <Effect key={`fx-${scene.id}-${i}`} effect={e} />
      ))}
    </div>
  )
}
