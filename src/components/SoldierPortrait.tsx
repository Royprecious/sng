import { useId } from 'react'
import {
  formatCombatRole,
  getTier,
  type CombatRole,
  type TierId,
} from '../data/clan'

const sizeClass = {
  sm: {
    box: 'h-10 w-10',
    text: 'text-[11px]',
    ring: 'rounded-lg',
    tier: 'text-[8px] px-1 py-0',
    scope: 'inset-1',
  },
  md: {
    box: 'h-14 w-14',
    text: 'text-base',
    ring: 'rounded-xl',
    tier: 'text-[9px] px-1.5 py-0.5',
    scope: 'inset-1.5',
  },
  lg: {
    box: 'h-24 w-24 sm:h-28 sm:w-28',
    text: 'text-2xl sm:text-3xl',
    ring: 'rounded-2xl',
    tier: 'text-[10px] px-2 py-0.5',
    scope: 'inset-2 sm:inset-3',
  },
  xl: {
    box: 'h-32 w-32',
    text: 'text-4xl',
    ring: 'rounded-2xl',
    tier: 'text-[10px] px-2 py-0.5',
    scope: 'inset-3',
  },
} as const

type PortraitSize = keyof typeof sizeClass

function roleAccent(combatRole: CombatRole | string): string {
  const r = combatRole.toLowerCase()
  if (r === 'sniper') return 'text-sky-300'
  if (r === 'fragger') return 'text-rose-300'
  if (r === 'igl') return 'text-cm-yellow'
  return 'text-emerald-300'
}

type SoldierPortraitProps = {
  initials: string
  tierId: TierId
  combatRole: CombatRole | string
  size?: PortraitSize
  /** Show tier code (T1–T5) in the scope instead of name initials. */
  center?: 'initials' | 'tier'
  className?: string
}

export function SoldierPortrait({
  initials,
  tierId,
  combatRole,
  size = 'lg',
  center = 'initials',
  className = '',
}: SoldierPortraitProps) {
  const uid = useId().replace(/:/g, '')
  const tier = getTier(tierId)
  const s = sizeClass[size]
  const display =
    center === 'tier'
      ? tier.code
      : initials.slice(0, 2).toUpperCase() || '??'

  return (
    <div
      className={`relative shrink-0 ${s.box} ${className}`}
      aria-hidden
    >
      <div
        className={`absolute inset-0 ${s.ring} bg-linear-to-br ${tier.color} opacity-90 blur-md`}
      />
      <div
        className={`relative h-full w-full overflow-hidden ${s.ring} border border-white/15 bg-[#060b14] shadow-[inset_0_0_24px_rgba(0,0,0,0.65),0_8px_32px_rgba(37,99,235,0.25)]`}
      >
        <div
          className={`absolute inset-0 bg-linear-to-br ${tier.color} opacity-25`}
        />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.35]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.12),transparent_55%)]" />

        <svg
          className={`pointer-events-none absolute ${s.scope} text-blue-400/50`}
          viewBox="0 0 100 100"
          aria-hidden
        >
          <defs>
            <linearGradient
              id={`scope-grad-${uid}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke={`url(#scope-grad-${uid})`}
            strokeWidth="1.2"
          />
          <circle
            cx="50"
            cy="50"
            r="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            opacity="0.55"
          />
          <line
            x1="50"
            y1="8"
            x2="50"
            y2="22"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.7"
          />
          <line
            x1="50"
            y1="78"
            x2="50"
            y2="92"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.7"
          />
          <line
            x1="8"
            y1="50"
            x2="22"
            y2="50"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.7"
          />
          <line
            x1="78"
            y1="50"
            x2="92"
            y2="50"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.7"
          />
          <circle cx="50" cy="50" r="3" fill="#CE1126" opacity="0.95" />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`${s.text} font-black text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] ${
              center === 'tier' ? 'tracking-wide' : 'tracking-tighter'
            }`}
            style={{
              textShadow:
                '0 0 20px rgba(59,130,246,0.45), 0 2px 0 rgba(0,0,0,0.5)',
            }}
          >
            {display}
          </span>
        </div>

        {size === 'sm' ? (
          <span className="absolute top-0.5 right-0.5 rounded bg-slate-950/90 px-1 text-[7px] font-black text-blue-200 ring-1 ring-blue-500/40">
            {center === 'tier'
              ? formatCombatRole(combatRole).slice(0, 3)
              : tier.code}
          </span>
        ) : (
          <div className="absolute inset-x-0 bottom-0 flex justify-center bg-linear-to-t from-black/80 to-transparent pb-1 pt-4">
            <span
              className={`rounded-full bg-slate-950/90 font-bold uppercase ring-1 ring-white/10 ${s.tier} ${roleAccent(combatRole)}`}
            >
              {formatCombatRole(combatRole).slice(0, 3)}
            </span>
          </div>
        )}

        <span className="pointer-events-none absolute top-1 left-1 h-2 w-2 border-t border-l border-cm-green/70" />
        <span className="pointer-events-none absolute top-1 right-1 h-2 w-2 border-t border-r border-cm-red/70" />
        <span className="pointer-events-none absolute bottom-1 left-1 h-2 w-2 border-b border-l border-cm-yellow/60" />
        <span className="pointer-events-none absolute right-1 bottom-1 h-2 w-2 border-r border-b border-blue-400/60" />
      </div>
    </div>
  )
}
