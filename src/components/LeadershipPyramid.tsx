import {
  CLAN_TAG,
  formatCombatRole,
  getTier,
  leadershipSlots,
  type LeadershipSlotTarget,
  type Soldier,
} from '../data/clan'
import { SoldierPortrait } from './SoldierPortrait'

type Variant = 'master' | 'mistress' | 'vice' | 'coordinator'

const borderClass: Record<Variant, string> = {
  master: 'hierarchy-card-border-master',
  mistress: 'hierarchy-card-border-mistress',
  vice: 'hierarchy-card-border-vice',
  coordinator: 'hierarchy-card-border-coordinator',
}

const variantStyles: Record<
  Variant,
  {
    inner: string
    badge: string
    corner: string
    avatarWrap: string
    avatar: string
    icon: string
  }
> = {
  master: {
    inner:
      'shadow-[inset_0_1px_0_rgba(252,209,22,0.15),0_24px_60px_rgba(0,0,0,0.5),0_0_80px_rgba(252,209,22,0.08)]',
    badge: 'bg-cm-yellow/10 text-cm-yellow ring-cm-yellow/50',
    corner: 'border-cm-yellow/70',
    avatarWrap: 'hierarchy-avatar-ring p-[3px] hierarchy-motion-safe animate-[hierarchy-pulse-glow_4s_ease-in-out_infinite]',
    avatar: 'h-24 w-24 text-2xl',
    icon: '★',
  },
  mistress: {
    inner: 'shadow-[inset_0_1px_0_rgba(206,17,38,0.12),0_16px_40px_rgba(0,0,0,0.45)]',
    badge: 'bg-cm-red/10 text-rose-100 ring-cm-red/45',
    corner: 'border-cm-red/55',
    avatarWrap: 'ring-2 ring-cm-red/45 ring-offset-2 ring-offset-slate-950',
    avatar: 'h-[4.5rem] w-[4.5rem] text-xl',
    icon: '◆',
  },
  vice: {
    inner: 'shadow-[inset_0_1px_0_rgba(59,130,246,0.15),0_16px_40px_rgba(0,0,0,0.4)]',
    badge: 'bg-blue-600/15 text-blue-100 ring-blue-500/45',
    corner: 'border-blue-400/55',
    avatarWrap: 'ring-2 ring-blue-500/40 ring-offset-2 ring-offset-slate-950',
    avatar: 'h-[4.5rem] w-[4.5rem] text-xl',
    icon: '▲',
  },
  coordinator: {
    inner:
      'shadow-[inset_0_1px_0_rgba(0,122,94,0.1),0_8px_24px_rgba(0,0,0,0.35)] group-hover:shadow-[0_12px_32px_rgba(0,122,94,0.15)]',
    badge: 'bg-cm-green/10 text-emerald-100 ring-cm-green/40',
    corner: 'border-cm-green/45',
    avatarWrap: 'ring-1 ring-cm-green/35 ring-offset-1 ring-offset-slate-950',
    avatar: 'h-14 w-14 text-base',
    icon: '●',
  },
}

function CornerBrackets({ colorClass }: { colorClass: string }) {
  return (
    <>
      <span
        className={`pointer-events-none absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 ${colorClass}`}
      />
      <span
        className={`pointer-events-none absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 ${colorClass}`}
      />
      <span
        className={`pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 ${colorClass}`}
      />
      <span
        className={`pointer-events-none absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 ${colorClass}`}
      />
    </>
  )
}

function ChainLink({ short }: { short?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center ${short ? 'py-1' : 'py-2'}`}
      aria-hidden
    >
      <div className="hierarchy-link h-6 w-px sm:h-8" />
      <div className="relative flex h-4 w-4 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/20" />
        <span className="relative h-2.5 w-2.5 rotate-45 border border-blue-300/80 bg-linear-to-br from-blue-600 to-slate-950 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
      </div>
      <div className="hierarchy-link h-6 w-px sm:h-8" />
    </div>
  )
}

function LeadershipNode({
  variant,
  title,
  subtitle,
  holder,
  wide,
  assignable,
  onAssign,
}: {
  variant: Variant
  title: string
  subtitle: string
  holder: Soldier | undefined
  wide?: boolean
  assignable?: boolean
  onAssign?: () => void
}) {
  const v = variantStyles[variant]
  const tier = holder ? getTier(holder.tier) : null

  const inner = (
    <>
        <div className="pointer-events-none absolute inset-0 hierarchy-card-scanlines opacity-60" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-blue-600/10 blur-3xl transition group-hover:bg-blue-500/15" />

        <CornerBrackets colorClass={v.corner} />
        <div className="cm-card-top absolute inset-x-4 top-0 h-px opacity-90" />

        <div className="relative flex flex-wrap items-center justify-center gap-2 px-1">
          <span
            className={`hidden h-6 w-6 items-center justify-center rounded-md bg-slate-950/80 text-[10px] ring-1 ring-white/10 min-[400px]:flex ${v.badge}`}
            aria-hidden
          >
            {v.icon}
          </span>
          <div
            className={`inline-flex max-w-full items-center justify-center gap-2 rounded-full px-3 py-1.5 text-[9px] font-bold tracking-[0.18em] uppercase ring-1 backdrop-blur-sm min-[400px]:px-4 min-[400px]:text-[10px] min-[400px]:tracking-[0.24em] ${v.badge}`}
          >
            <span className="text-center leading-tight">{title}</span>
          </div>
          <span
            className={`hidden h-6 w-6 items-center justify-center rounded-md bg-slate-950/80 text-[10px] ring-1 ring-white/10 min-[400px]:flex ${v.badge}`}
            aria-hidden
          >
            {v.icon}
          </span>
        </div>

        {holder && tier ? (
          <>
            <div className={`relative mx-auto mt-6 w-fit rounded-2xl ${v.avatarWrap}`}>
              <SoldierPortrait
                initials={holder.avatar}
                tierId={holder.tier}
                combatRole={holder.combatRole}
                size={variant === 'coordinator' ? 'md' : 'lg'}
              />
            </div>
            <div className="relative mt-5 space-y-1">
              <h3 className="truncate text-xl font-black tracking-tight text-white drop-shadow-sm sm:text-2xl">
                {holder.gamertag}
              </h3>
              <p className="text-sm font-semibold text-blue-300/90">
                {formatCombatRole(holder.combatRole)}
              </p>
            </div>
            <div className="relative mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-slate-950/90 px-2.5 py-1 text-[11px] font-bold text-blue-200 ring-1 ring-blue-500/30">
                {tier.code} · {tier.label}
              </span>
              <span className="rounded-full bg-slate-950/90 px-2.5 py-1 text-[11px] font-bold text-white ring-1 ring-slate-700">
                {formatCombatRole(holder.combatRole)}
              </span>
              <span className="rounded-full bg-cm-green/10 px-2.5 py-1 text-[11px] font-bold text-emerald-200 ring-1 ring-cm-green/30">
                {holder.region}
              </span>
            </div>
          </>
        ) : (
          <div className="relative mt-8 rounded-xl border border-dashed border-slate-600/70 bg-slate-950/60 py-12 backdrop-blur-sm">
            <p className="text-sm font-bold tracking-[0.15em] text-slate-400 uppercase">
              Open position
            </p>
            <p className="mt-2 text-xs text-slate-600">
              {assignable ? 'Tap to assign a leader' : 'Awaiting assignment'}
            </p>
          </div>
        )}

        <p className="relative mt-5 border-t border-white/5 pt-4 text-[11px] leading-relaxed text-slate-500">
          {subtitle}
        </p>
        {assignable && (
          <p className="relative mt-3 text-[10px] font-bold tracking-widest text-cm-yellow/80 uppercase">
            Tap to edit · Clan Master
          </p>
        )}
    </>
  )

  return (
    <div
      className={`w-full max-w-[100vw] rounded-2xl p-px ${borderClass[variant]} ${wide ? 'sm:max-w-xl' : 'sm:max-w-sm'} ${variant === 'master' ? 'hierarchy-motion-safe animate-[hierarchy-node-float_6s_ease-in-out_infinite]' : ''}`}
    >
      {assignable && onAssign ? (
        <button
          type="button"
          onClick={onAssign}
          className={`group relative w-full overflow-hidden rounded-[calc(1rem-1px)] border border-white/5 bg-linear-to-b from-slate-900/98 via-slate-950/98 to-[#040810] p-4 text-center backdrop-blur-md transition duration-500 hover:border-cm-yellow/30 hover:shadow-[0_0_40px_rgba(252,209,22,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cm-yellow/50 sm:p-6 ${v.inner}`}
        >
          {inner}
        </button>
      ) : (
        <article
          className={`group relative overflow-hidden rounded-[calc(1rem-1px)] border border-white/5 bg-linear-to-b from-slate-900/98 via-slate-950/98 to-[#040810] p-4 text-center backdrop-blur-md transition duration-500 hover:border-white/10 sm:p-6 ${v.inner}`}
        >
          {inner}
        </article>
      )}
    </div>
  )
}

type LeadershipPyramidProps = {
  master: Soldier | undefined
  mistress: Soldier | undefined
  vice: Soldier | undefined
  coordinators: [
    Soldier | undefined,
    Soldier | undefined,
    Soldier | undefined,
  ]
  canAssign?: boolean
  onAssignSlot?: (slot: LeadershipSlotTarget) => void
}

export function LeadershipPyramid({
  master,
  mistress,
  vice,
  coordinators,
  canAssign,
  onAssignSlot,
}: LeadershipPyramidProps) {
  const slot = leadershipSlots
  const assignable = Boolean(canAssign && onAssignSlot)

  return (
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-8 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-600/25 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-48 w-48 -translate-x-1/2 rounded-full bg-cm-yellow/15 blur-[100px]" />

      <div className="relative overflow-hidden rounded-3xl border border-slate-700/50 bg-slate-950/50 p-1 shadow-[0_0_0_1px_rgba(59,130,246,0.08),0_32px_80px_rgba(0,0,0,0.55)]">
        <div className="cm-card-top h-1 w-full" />
        <div className="relative bg-slate-950/80 p-4 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-[0.07]" />

          <div className="relative mb-10 text-center">
            <p className="text-xs font-bold tracking-[0.35em] text-blue-400 uppercase">
              Chain of command
            </p>
            <h2 className="mt-2 text-lg font-black tracking-wide text-white sm:text-xl">
              {CLAN_TAG}{' '}
              <span className="cm-headline-gradient bg-clip-text text-transparent">
                High Command
              </span>
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Leadership hierarchy top to bottom
            </p>
          </div>

          <div className="relative flex flex-col items-center">
            <LeadershipNode
              variant="master"
              title={slot[0].title}
              subtitle={slot[0].subtitle}
              holder={master}
              wide
              assignable={assignable}
              onAssign={() => onAssignSlot?.({ rank: 'clan_master' })}
            />

            <ChainLink />

            <LeadershipNode
              variant="mistress"
              title={slot[1].title}
              subtitle={slot[1].subtitle}
              holder={mistress}
              assignable={assignable}
              onAssign={() => onAssignSlot?.({ rank: 'clan_mistress' })}
            />

            <ChainLink />

            <LeadershipNode
              variant="vice"
              title={slot[2].title}
              subtitle={slot[2].subtitle}
              holder={vice}
              assignable={assignable}
              onAssign={() =>
                onAssignSlot?.({ rank: 'vice_clan_master' })
              }
            />

            <ChainLink short />

            <div className="relative w-full max-w-4xl pt-2">
              <div className="absolute top-0 left-[8%] right-[8%] hidden h-px sm:block hierarchy-bar" />
              <div className="grid grid-cols-1 gap-4 min-[540px]:grid-cols-3 min-[540px]:gap-5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="mb-2 hidden h-6 w-px sm:block hierarchy-link" />
                    <LeadershipNode
                      variant="coordinator"
                      title={`${slot[3].title} ${i + 1}`}
                      subtitle={slot[3].subtitle}
                      holder={coordinators[i]}
                      assignable={assignable}
                      onAssign={() =>
                        onAssignSlot?.({
                          rank: 'clan_coordinator',
                          coordinatorIndex: i as 0 | 1 | 2,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
