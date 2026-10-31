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
  const box = 'pointer-events-none absolute h-3.5 w-3.5 sm:top-3 sm:h-5 sm:w-5 top-2'
  return (
    <>
      <span className={`${box} left-2 border-t-2 border-l-2 sm:left-3 ${colorClass}`} />
      <span className={`${box} right-2 border-t-2 border-r-2 sm:right-3 ${colorClass}`} />
      <span className={`${box} bottom-2 left-2 border-b-2 border-l-2 sm:bottom-3 sm:left-3 ${colorClass}`} />
      <span className={`${box} bottom-2 right-2 border-b-2 border-r-2 sm:bottom-3 sm:right-3 ${colorClass}`} />
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
        className={`relative overflow-hidden rounded-[calc(1rem-1px)] border border-white/5 bg-linear-to-b from-slate-900/98 via-slate-950/98 to-[#040810] text-center ${exportLayout ? 'px-6 py-8' : 'px-3 py-4 sm:p-6'} ${v.inner}`}
      >
        <CameroonStripe
          size="md"
          className="absolute inset-x-0 top-0 rounded-none opacity-95"
        />
        <div className="pointer-events-none absolute inset-0 hierarchy-card-scanlines opacity-50" />
        <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-600/15 blur-3xl" />

        <CornerBrackets colorClass={v.corner} />

        <div className={`relative ${exportLayout ? 'pt-4' : 'pt-2 sm:pt-4'}`}>
          <p
            className={`font-bold tracking-[0.35em] text-blue-400 uppercase ${exportLayout ? 'text-[10px]' : 'text-[8px] sm:text-[10px]'}`}
          >
            {CLAN_NAME}
          </p>
          <p
            className={`mt-0.5 font-black tracking-tight text-white sm:mt-1 ${exportLayout ? 'text-lg' : 'text-sm sm:text-lg'}`}
          >
            {CLAN_TAG}{' '}
            <span className="text-blue-400">Member card</span>
          </p>
        </div>

        <div
          className={`relative mx-auto w-fit rounded-2xl ${exportLayout ? 'mt-6' : 'mt-3 sm:mt-6'} ${v.avatarWrap}`}
        >
          <SoldierPortrait
            initials={soldier.avatar}
            tierId={soldier.tier}
            combatRole={soldier.combatRole}
            center="tier"
            size={exportLayout ? 'xl' : 'card'}
          />
        </div>

        <div
          className={`relative space-y-0.5 px-1 sm:space-y-1 sm:px-2 ${exportLayout ? 'mt-5' : 'mt-3 sm:mt-5'}`}
        >
          <h3
            className={`font-black tracking-tight text-white drop-shadow-sm ${exportLayout ? 'text-2xl' : 'text-base sm:text-2xl'}`}
          >
            {soldier.gamertag}
          </h3>
          <p
            className={`font-semibold text-blue-300/90 ${exportLayout ? 'text-sm' : 'text-xs sm:text-sm'}`}
          >
            {formatCombatRole(soldier.combatRole)}
          </p>
        </div>

        <div
          className={`relative inline-flex max-w-full items-center justify-center rounded-full font-bold tracking-[0.2em] uppercase ring-1 backdrop-blur-sm ${v.badge} ${exportLayout ? 'mt-4 px-4 py-1.5 text-[10px]' : 'mt-2.5 px-3 py-1 text-[9px] sm:mt-4 sm:px-4 sm:py-1.5 sm:text-[10px]'}`}
        >
          {rankLabel}
        </div>

        <div
          className={`relative grid grid-cols-2 gap-1.5 px-0.5 text-left sm:grid-cols-4 sm:gap-2 sm:px-1 ${exportLayout ? 'mt-5' : 'mt-3 sm:mt-5'}`}
        >
          {[
            { label: 'Tier', value: formatTierLabel(soldier.tier) },
            { label: 'Title', value: soldier.role },
            { label: 'Region', value: soldier.region },
            { label: 'Role', value: formatCombatRole(soldier.combatRole) },
          ].map((row) => (
            <div
              key={row.label}
              className={`rounded-lg border border-white/5 bg-slate-950/70 ${exportLayout ? 'px-2 py-2.5' : 'px-1.5 py-1.5 sm:px-2 sm:py-2.5'}`}
            >
              <p className="text-[8px] font-bold tracking-wider text-slate-500 uppercase sm:text-[9px]">
                {row.label}
              </p>
              <p className="mt-0.5 truncate text-[11px] font-bold text-white sm:text-xs">
                {row.value}
              </p>
            </div>
          ))}
        </div>

        <div
          className={`relative flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 ${exportLayout ? 'mt-5' : 'mt-3 hidden sm:flex sm:mt-5'}`}
        >
          <span className="rounded-full bg-slate-950/90 px-2.5 py-1 text-[11px] font-bold text-blue-200 ring-1 ring-blue-500/30">
            {tier.code} · {tier.label}
          </span>
          <span className="rounded-full bg-cm-green/10 px-2.5 py-1 text-[11px] font-bold text-emerald-200 ring-1 ring-cm-green/30">
            {soldier.region}
          </span>
        </div>

        <p
          className={`relative border-t border-white/5 font-bold tracking-[0.25em] text-slate-500 uppercase ${exportLayout ? 'mt-6 pt-4 text-[10px]' : 'mt-3 pt-2.5 text-[8px] sm:mt-6 sm:pt-4 sm:text-[10px]'}`}
        >
          Cod mobile · {CLAN_TAG}
        </p>
      </div>
    </div>
  )
})
