import type { ActorState } from '@/lib/cartoon/types'

function stateClass(state: ActorState | undefined, facing: 'left' | 'right') {
  const s = state ?? 'idle'
  return `cc-char cc-${s} cc-face-${facing}`
}

function Shadow({ rx = 40 }: { rx?: number }) {
  return (
    <>
      <ellipse cx={0} cy={4} rx={rx} ry={9} className="cc-shadow" />
      <ellipse cx={0} cy={4} rx={rx * 0.5} ry={5} className="cc-shadow-core" />
    </>
  )
}

type Palette = 'hacker' | 'victim' | 'defender'

function Hooded({ palette, state }: { palette: Palette; state: ActorState }) {
  return (
    <g className={stateClass(state, 'right')}>
      <Shadow rx={44} />

      {/* legs */}
      <rect x={-23} y={-74} width={19} height={74} rx={9} fill="#1e293b" />
      <rect x={5} y={-74} width={19} height={72} rx={9} fill="#0f172a" />
      <rect x={-28} y={-15} width={27} height={15} rx={7} fill="#0b1220" />
      <rect x={2} y={-14} width={28} height={14} rx={7} fill="#020617" />

      <path d="M-42 -72 Q-48 -152 -30 -170 L30 -168 Q48 -150 42 -70 Z" fill={`url(#hb-${palette})`} />
      <path d="M-40 -70 Q-46 -150 -28 -168 L28 -168 Q46 -150 40 -70 Z" fill="url(#gShade)" />
      <path d="M-26 -80 L26 -80 L22 -112 L-22 -112 Z" fill="rgba(0,0,0,0.22)" />

      <path d="M-42 -158 Q-56 -118 -50 -80" stroke={`url(#hb-${palette})`} strokeWidth={19} strokeLinecap="round" fill="none" />
      <path d="M42 -158 Q56 -118 50 -80" stroke={`url(#hb-${palette})`} strokeWidth={19} strokeLinecap="round" fill="none" />

      <path
        d="M-46 -150 Q-60 -214 -6 -220 L6 -220 Q60 -214 46 -150 Q24 -178 0 -178 Q-24 -178 -46 -150 Z"
        fill={`url(#hh-${palette})`}
      />
      <path
        d="M-46 -150 Q-60 -214 -6 -220"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />

      <ellipse cx={4} cy={-182} rx={21} ry={25} fill="#04060c" />
      <ellipse cx={4} cy={-182} rx={21} ry={25} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={2} />

      <path d="M-7 -154 L-9 -122" stroke="rgba(255,255,255,0.5)" strokeWidth={3} strokeLinecap="round" />
      <path d="M7 -150 Q9 -136 9 -122" stroke="rgba(255,255,255,0.35)" strokeWidth={3} fill="none" strokeLinecap="round" />

      <circle cx={-9} cy={-116} r={3.4} fill="rgba(255,255,255,0.55)" />
      <circle cx={10} cy={-118} r={3.4} fill="rgba(255,255,255,0.45)" />

      {state === 'type' && (
        <g className="cc-hands">
          <ellipse cx={44} cy={-104} rx={12} ry={11} fill="#0f172a" />
          <ellipse cx={30} cy={-96} rx={11} ry={10} fill="#111827" />
        </g>
      )}
    </g>
  )
}

function Server({ state = 'idle' }: { state?: ActorState }) {
  return (
    <g className={stateClass(state, 'right')}>
      <Shadow rx={60} />
      <rect x={-58} y={-190} width={116} height={190} rx={16} fill="url(#sMetal)" />
      <rect x={-58} y={-190} width={116} height={190} rx={16} fill="none" stroke="rgba(148,163,184,0.4)" strokeWidth={2} />

      <rect x={-44} y={-176} width={88} height={62} rx={10} fill="#020617" stroke="rgba(56,189,248,0.35)" />
      <g className={state === 'evil' ? 'cc-databars cc-fast' : 'cc-databars'}>
        <rect x={-36} y={-166} width={70} height={6} rx={3} fill="#38bdf8" opacity={0.85} />
        <rect x={-36} y={-154} width={52} height={6} rx={3} fill="#22d3ee" opacity={0.7} />
        <rect x={-36} y={-142} width={64} height={6} rx={3} fill="#34d399" opacity={0.7} />
        <rect x={-36} y={-130} width={40} height={6} rx={3} fill="#fbbf24" opacity={0.7} />
      </g>

      <g className={state === 'evil' ? 'cc-leds cc-fast' : 'cc-leds'}>
        <circle cx={-38} cy={-96} r={5} fill="#34d399" />
        <circle cx={-20} cy={-96} r={5} fill="#fbbf24" />
        <circle cx={-2} cy={-96} r={5} fill="#fb7185" />
      </g>
      <rect x={16} y={-102} width={30} height={12} rx={4} fill="#0b1220" stroke="rgba(148,163,184,0.3)" />

      <g fill="rgba(15,23,42,0.9)" stroke="rgba(148,163,184,0.18)">
        <rect x={-44} y={-72} width={88} height={12} rx={4} />
        <rect x={-44} y={-54} width={88} height={12} rx={4} />
        <rect x={-44} y={-36} width={88} height={12} rx={4} />
      </g>
      <rect x={-58} y={-14} width={116} height={14} rx={6} fill="rgba(2,6,23,0.9)" />
      <text x={0} y={-2} textAnchor="middle" fontSize={12} fontWeight={800} fill="#64748b" fontFamily="ui-monospace, monospace">
        nova.example
      </text>
    </g>
  )
}

function Browser({ state = 'idle' }: { state?: ActorState }) {
  return (
    <g className={stateClass(state, 'left')}>
      <Shadow rx={66} />
      <rect x={-98} y={-200} width={196} height={200} rx={16} fill="url(#glassWin)" stroke="rgba(148,163,184,0.4)" strokeWidth={2} />
      <rect x={-98} y={-200} width={196} height={30} rx={16} fill="rgba(15,23,42,0.9)" />
      <rect x={-98} y={-186} width={196} height={16} fill="rgba(15,23,42,0.9)" />
      <circle cx={-80} cy={-185} r={5} fill="#fb7185" />
      <circle cx={-64} cy={-185} r={5} fill="#fbbf24" />
      <circle cx={-48} cy={-185} r={5} fill="#34d399" />
      <rect x={-34} y={-192} width={124} height={14} rx={7} fill="#020617" />
      <text x={-26} y={-182} fontSize={8.5} fill="#94a3b8" fontFamily="ui-monospace, monospace">
        https://nova.example/search
      </text>

      <rect x={-84} y={-158} width={168} height={20} rx={7} fill="rgba(2,6,23,0.85)" stroke="rgba(56,189,248,0.3)" />
      <text x={-74} y={-144} fontSize={9} fill="#64748b" fontFamily="ui-monospace, monospace">
        search…
      </text>

      <g className="cc-scanlines">
        <rect x={-84} y={-128} width={140} height={9} rx={4} fill="rgba(148,163,184,0.35)" />
        <rect x={-84} y={-112} width={120} height={9} rx={4} fill="rgba(148,163,184,0.28)" />
        <rect x={-84} y={-96} width={150} height={9} rx={4} fill="rgba(148,163,184,0.28)" />
      </g>
      <rect
        x={-84}
        y={-78}
        width={168}
        height={34}
        rx={7}
        fill={state === 'evil' ? 'rgba(244,63,94,0.18)' : 'rgba(56,189,248,0.12)'}
        stroke={state === 'evil' ? 'rgba(244,63,94,0.6)' : 'rgba(56,189,248,0.4)'}
      />
      <text x={-74} y={-56} fontSize={9.5} fill={state === 'evil' ? '#fb7185' : '#7dd3fc'} fontFamily="ui-monospace, monospace">
        result
      </text>
    </g>
  )
}

function Cloud() {
  return (
    <g className="cc-char cc-idle">
      <g className="cc-cloud-bob">
        <ellipse cx={0} cy={-62} rx={70} ry={42} fill="url(#cloudFill)" />
        <ellipse cx={-46} cy={-48} rx={38} ry={28} fill="url(#cloudFill)" />
        <ellipse cx={46} cy={-48} rx={38} ry={28} fill="url(#cloudFill)" />
        <g stroke="rgba(125,211,252,0.5)" strokeWidth={2} fill="none">
          <path d="M-46 -60 Q0 -92 46 -60" />
        </g>
        <circle cx={-46} cy={-60} r={4} fill="#7dd3fc" />
        <circle cx={0} cy={-92} r={4} fill="#7dd3fc" />
        <circle cx={46} cy={-60} r={4} fill="#7dd3fc" />
        <text x={0} y={-54} textAnchor="middle" fontSize={13} fontWeight={800} fill="#cbd5e1" fontFamily="ui-monospace, monospace">
          INTERNET
        </text>
      </g>
    </g>
  )
}

export function Character({ kind, state }: { kind: string; state?: ActorState }) {
  switch (kind) {
    case 'hacker':
      return <Hooded palette="hacker" state={state ?? 'idle'} />
    case 'victim':
      return <Hooded palette="victim" state={state ?? 'idle'} />
    case 'defender':
      return <Hooded palette="defender" state={state ?? 'idle'} />
    case 'server':
      return <Server state={state} />
    case 'browser':
      return <Browser state={state} />
    case 'cloud':
      return <Cloud />
    default:
      return null
  }
}
