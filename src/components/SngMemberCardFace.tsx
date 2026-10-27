import { forwardRef } from 'react'
import {
  CLAN_NAME,
  CLAN_TAG,
  formatCombatRole,
  formatTierLabel,
  getClanRankLabel,
  getTier,
  type Soldier,
} from '../data/clan'
import { CameroonStripe } from './CameroonStripe'
import { SoldierPortrait } from './SoldierPortrait'
import {
  memberCardBorderClass,
  memberCardStyles,
  memberCardVisualForSoldier,
} from '../lib/memberCardTheme'

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

type SngMemberCardFaceProps = {
  soldier: Soldier
  /** Fixed layout for PNG export (no responsive shrink). */
  exportLayout?: boolean
  className?: string
}

export const SngMemberCardFace = forwardRef<
  HTMLDivElement,
  SngMemberCardFaceProps
>(function SngMemberCardFace({ soldier, exportLayout, className = '' }, ref) {
  const visual = memberCardVisualForSoldier(soldier)
  const v = memberCardStyles[visual]
  const tier = getTier(soldier.tier)
  const rankLabel = getClanRankLabel(soldier.clanRank)

  return (
    <div
      ref={ref}
      className={`rounded-2xl p-px ${memberCardBorderClass[visual]} ${className}`}
    >
      <div
        className={`relative overflow-hidden rounded-[calc(1rem-1px)] border border-white/5 bg-linear-to-b from-slate-900/98 via-slate-950/98 to-[#040810] text-center ${exportLayout ? 'px-6 py-8' : 'p-5 sm:p-6'} ${v.inner}`}
      >
        <CameroonStripe
          size="md"
          className="absolute inset-x-0 top-0 rounded-none opacity-95"
        />
        <div className="pointer-events-none absolute inset-0 hierarchy-card-scanlines opacity-50" />
        <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-600/15 blur-3xl" />

        <CornerBrackets colorClass={v.corner} />

        <div className="relative pt-4">
          <p className="text-[10px] font-bold tracking-[0.35em] text-blue-400 uppercase">
            {CLAN_NAME}
          </p>
          <p className="mt-1 text-lg font-black tracking-tight text-white">
            {CLAN_TAG}{' '}
            <span className="text-blue-400">Member card</span>
          </p>
        </div>

        <div
          className={`relative mx-auto mt-6 w-fit rounded-2xl ${v.avatarWrap}`}
        >
          <SoldierPortrait
            initials={soldier.avatar}
            tierId={soldier.tier}
            combatRole={soldier.combatRole}
            center="tier"
            size={exportLayout ? 'xl' : 'lg'}
          />
        </div>

        <div className="relative mt-5 space-y-1 px-2">
          <h3
            className={`font-black tracking-tight text-white drop-shadow-sm ${exportLayout ? 'text-2xl' : 'text-xl sm:text-2xl'}`}
          >
            {soldier.gamertag}
          </h3>
          <p className="text-sm font-semibold text-blue-300/90">
            {formatCombatRole(soldier.combatRole)}
          </p>
        </div>

        <div
          className={`relative mt-4 inline-flex max-w-full items-center justify-center rounded-full px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase ring-1 backdrop-blur-sm ${v.badge}`}
        >
          {rankLabel}
        </div>

        <div className="relative mt-5 grid grid-cols-2 gap-2 px-1 text-left sm:grid-cols-4">
          {[
            { label: 'Tier', value: formatTierLabel(soldier.tier) },
            { label: 'Title', value: soldier.role },
            { label: 'Region', value: soldier.region },
            { label: 'Role', value: formatCombatRole(soldier.combatRole) },
          ].map((row) => (
            <div
              key={row.label}
              className="rounded-lg border border-white/5 bg-slate-950/70 px-2 py-2.5"
            >
              <p className="text-[9px] font-bold tracking-wider text-slate-500 uppercase">
                {row.label}
              </p>
              <p className="mt-0.5 truncate text-xs font-bold text-white">
                {row.value}
              </p>
            </div>
          ))}
        </div>

        <div className="relative mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-slate-950/90 px-2.5 py-1 text-[11px] font-bold text-blue-200 ring-1 ring-blue-500/30">
            {tier.code} · {tier.label}
          </span>
          <span className="rounded-full bg-cm-green/10 px-2.5 py-1 text-[11px] font-bold text-emerald-200 ring-1 ring-cm-green/30">
            {soldier.region}
          </span>
        </div>

        <p className="relative mt-6 border-t border-white/5 pt-4 text-[10px] font-bold tracking-[0.25em] text-slate-500 uppercase">
          Cod mobile · {CLAN_TAG}
        </p>
      </div>
    </div>
  )
})
