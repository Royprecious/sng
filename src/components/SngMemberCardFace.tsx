import { forwardRef } from 'react'
import {
  CLAN_NAME,
  CLAN_TAG,
  formatCombatRole,
  getClanRankLabel,
  getTier,
  leadershipSlots,
  type Soldier,
} from '../data/clan'
import { CameroonStripe } from './CameroonStripe'
import { SoldierPortrait } from './SoldierPortrait'
import {
  memberCardBorderClass,
  memberCardHonorLine,
  memberCardRosterId,
  memberCardStyles,
  memberCardVisualForSoldier,
} from '../lib/memberCardTheme'

function CornerBrackets({
  colorClass,
  fullSize,
}: {
  colorClass: string
  fullSize?: boolean
}) {
  if (fullSize) {
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
  const box =
    'pointer-events-none absolute h-3.5 w-3.5 sm:top-3 sm:h-5 sm:w-5 top-2'
  return (
    <>
      <span className={`${box} left-2 border-t-2 border-l-2 sm:left-3 ${colorClass}`} />
      <span className={`${box} right-2 border-t-2 border-r-2 sm:right-3 ${colorClass}`} />
      <span
        className={`${box} bottom-2 left-2 border-b-2 border-l-2 sm:bottom-3 sm:left-3 ${colorClass}`}
      />
      <span
        className={`${box} bottom-2 right-2 border-b-2 border-r-2 sm:bottom-3 sm:right-3 ${colorClass}`}
      />
    </>
  )
}

function leadershipSubtitle(soldier: Soldier): string | null {
  if (soldier.clanRank === 'member') return null
  const slot = leadershipSlots.find((s) => s.rank === soldier.clanRank)
  return slot?.subtitle ?? null
}

function statValue(raw: string): string {
  const t = raw.trim()
  return t || '—'
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
  const honorLine = memberCardHonorLine[visual]
  const rosterId = memberCardRosterId(soldier.id)
  const leaderLine = leadershipSubtitle(soldier)

  const rosterStats = [
    { label: 'Specialty', value: statValue(soldier.specialty) },
    { label: 'K/D', value: statValue(soldier.kd) },
    { label: 'Region', value: statValue(soldier.region) },
    { label: 'Title', value: statValue(soldier.role) },
  ]

  return (
    <div
      ref={ref}
      className={`rounded-2xl p-px ${memberCardBorderClass[visual]} ${exportLayout ? 'w-[400px] shrink-0' : ''} ${className}`}
    >
      <div
        className={`relative overflow-hidden rounded-[calc(1rem-1px)] border border-white/5 bg-linear-to-b from-slate-900/98 via-slate-950/98 to-[#040810] text-center ${exportLayout ? 'px-6 py-8' : 'px-3 py-4 sm:p-6'} ${v.inner}`}
      >
        <CameroonStripe
          size="md"
          className="absolute inset-x-0 top-0 rounded-none opacity-95"
        />
        <div className="pointer-events-none absolute inset-0 hierarchy-card-scanlines opacity-50" />
        <div className="member-card-shine" aria-hidden />
        <div
          className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-blue-600/15 blur-3xl"
          aria-hidden
        />
        <p className="member-card-watermark" aria-hidden>
          {CLAN_TAG}
        </p>

        <CornerBrackets colorClass={v.corner} fullSize={exportLayout} />

        <div className={`relative z-10 ${exportLayout ? 'pt-4' : 'pt-2 sm:pt-4'}`}>
          <p
            className={`member-card-verified-seal ${exportLayout ? 'mb-3 px-3 py-1.5 text-[9px]' : 'mx-auto mb-2 px-2.5 py-1 text-[7px] sm:mb-3 sm:px-3 sm:py-1.5 sm:text-[9px]'}`}
          >
            <span aria-hidden>✓</span>
            Official roster credentials
          </p>
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
          <p
            className={`mx-auto max-w-[90%] font-semibold text-slate-400 ${exportLayout ? 'mt-2 text-[11px]' : 'mt-1 text-[10px] leading-snug sm:mt-2 sm:text-[11px]'}`}
          >
            {honorLine}
          </p>
        </div>

        <div
          className={`relative z-10 mx-auto w-fit rounded-2xl ${exportLayout ? 'mt-6' : 'mt-3 sm:mt-6'} ${v.avatarWrap}`}
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
          className={`relative z-10 space-y-0.5 px-1 sm:space-y-1 sm:px-2 ${exportLayout ? 'mt-5' : 'mt-3 sm:mt-5'}`}
        >
          <h3
            className={`font-black tracking-tight text-white drop-shadow-sm ${exportLayout ? 'text-2xl' : 'text-base sm:text-2xl'}`}
          >
            {soldier.gamertag}
          </h3>
          <p
            className={`font-semibold text-blue-300/90 ${exportLayout ? 'text-sm' : 'text-xs sm:text-sm'}`}
          >
            {formatCombatRole(soldier.combatRole)} · {soldier.region}
          </p>
        </div>

        <div
          className={`relative z-10 inline-flex max-w-full items-center justify-center rounded-full font-bold tracking-[0.2em] uppercase ring-1 ${exportLayout ? '' : 'backdrop-blur-sm'} ${v.badge} ${exportLayout ? 'mt-4 px-4 py-1.5 text-[10px]' : 'mt-2.5 px-3 py-1 text-[9px] sm:mt-4 sm:px-4 sm:py-1.5 sm:text-[10px]'}`}
        >
          {rankLabel}
        </div>
        {leaderLine && (
          <p
            className={`relative z-10 mx-auto max-w-[92%] font-medium text-slate-400 ${exportLayout ? 'mt-2 text-[11px]' : 'mt-1.5 text-[10px] sm:mt-2 sm:text-[11px]'}`}
          >
            {leaderLine}
          </p>
        )}

        <div
          className={`relative z-10 grid gap-2 px-1 text-left ${exportLayout ? 'mt-5 grid-cols-4' : 'mt-3 grid-cols-2 gap-1.5 px-0.5 sm:mt-5 sm:grid-cols-4 sm:px-1'}`}
        >
          {rosterStats.map((row) => (
            <div
              key={row.label}
              className={`rounded-lg border border-white/8 bg-slate-950/80 ${exportLayout ? 'px-2 py-2.5' : 'px-1.5 py-1.5 sm:px-2 sm:py-2.5'}`}
            >
              <p
                className={`font-bold tracking-wider text-slate-500 uppercase ${exportLayout ? 'text-[9px]' : 'text-[8px] sm:text-[9px]'}`}
              >
                {row.label}
              </p>
              <p
                className={`mt-0.5 truncate font-bold text-white ${exportLayout ? 'text-xs' : 'text-[11px] sm:text-xs'}`}
              >
                {row.value}
              </p>
            </div>
          ))}
        </div>

        <div
          className={`relative z-10 flex flex-wrap items-center justify-center gap-2 ${exportLayout ? 'mt-5' : 'mt-3 hidden sm:mt-5 sm:flex'}`}
        >
          <span className="rounded-full bg-slate-950/90 px-2.5 py-1 text-[11px] font-bold text-blue-200 ring-1 ring-blue-500/30">
            {tier.code} · {tier.minPoints.toLocaleString()}+ pts tier
          </span>
          <span className="rounded-full bg-cm-yellow/10 px-2.5 py-1 text-[11px] font-bold text-cm-yellow ring-1 ring-cm-yellow/35">
            COD Mobile · Ranked ready
          </span>
        </div>

        <footer
          className={`relative z-10 border-t border-white/8 ${exportLayout ? 'mt-6 pt-4' : 'mt-3 pt-2.5 sm:mt-6 sm:pt-4'}`}
        >
          <p
            className={`font-black tracking-widest text-emerald-400/90 uppercase ${exportLayout ? 'text-[10px]' : 'text-[8px] sm:text-[10px]'}`}
          >
            Verified on {CLAN_NAME} roster
          </p>
          <p
            className={`mt-1 font-mono font-bold tracking-wider text-slate-400 ${exportLayout ? 'text-xs' : 'text-[10px] sm:text-xs'}`}
          >
            ID {rosterId}
          </p>
          <p
            className={`mt-2 font-bold tracking-[0.2em] text-slate-600 uppercase ${exportLayout ? 'text-[10px]' : 'text-[8px] sm:text-[10px]'}`}
          >
            Share with pride · {CLAN_TAG}
          </p>
        </footer>
      </div>
    </div>
  )
})
