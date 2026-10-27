import { forwardRef } from 'react'
import { CLAN_NAME, CLAN_TAG } from '../data/clan'
import { podiumRankTheme, type PodiumRank } from '../lib/teamPodiumTheme'
import { formatPoints } from '../lib/tournament'
import { CameroonStripe } from './CameroonStripe'

export type TeamPodiumCardData = {
  teamName: string
  totalPoints: number
  totalKills: number
  matchesPlayed: number
  tournamentName: string
  eventDateLabel?: string
}

type TeamPodiumCardFaceProps = {
  rank: PodiumRank
  data: TeamPodiumCardData
  exportLayout?: boolean
  featured?: boolean
  compact?: boolean
  className?: string
}

export const TeamPodiumCardFace = forwardRef<
  HTMLDivElement,
  TeamPodiumCardFaceProps
>(function TeamPodiumCardFace(
  { rank, data, exportLayout, featured, compact, className = '' },
  ref,
) {
  const theme = podiumRankTheme[rank]
  const isFirst = featured ?? rank === 1

  const shellPad = exportLayout
    ? isFirst
      ? 'min-h-[380px] px-5 pb-10 pt-0'
      : 'min-h-[320px] px-4 py-8'
    : isFirst
      ? 'min-h-[300px] px-5 pb-7 pt-0 sm:min-h-[340px] sm:px-7 sm:pb-9 md:min-h-[380px]'
      : 'min-h-[260px] p-4 sm:min-h-[280px] sm:p-5'

  const flagBleed = exportLayout ? '-mx-5' : '-mx-5 sm:-mx-7'

  return (
    <div
      ref={ref}
      className={`rounded-2xl p-px shadow-lg ${theme.borderGradient} ${isFirst ? 'shadow-amber-500/25 ring-1 ring-white/10' : ''} ${className}`}
    >
      <div
        className={`relative flex flex-col justify-center overflow-hidden rounded-[calc(1rem-1px)] border border-white/5 bg-linear-to-b from-slate-900/98 via-slate-950 to-[#040810] text-center ${theme.innerGlow} ${shellPad}`}
      >
        {isFirst && (
          <>
            <div className="podium-card-light-burst" aria-hidden />
            <div className="podium-card-light-cone" aria-hidden />
          </>
        )}

        {isFirst && (
          <div className={`relative z-20 mb-5 shrink-0 ${flagBleed}`}>
            <div className="podium-flag-under-light relative">
              <CameroonStripe
                size="md"
                spotlight
                className="w-full max-w-none"
              />
            </div>
          </div>
        )}

        <div className="relative z-10">
          {!compact && (
            <>
              <p className="text-[10px] font-bold tracking-[0.25em] text-blue-400 uppercase">
                {CLAN_TAG} · {CLAN_NAME}
              </p>
              <CameroonStripe size="sm" className="mx-auto mt-3 max-w-[5rem]" />
              <p className="mt-4 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {data.tournamentName}
              </p>
              {data.eventDateLabel && (
                <p className="mt-1 text-[11px] text-slate-600">
                  {data.eventDateLabel}
                </p>
              )}
            </>
          )}

          <div
            className={`mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-black tracking-wider uppercase ring-1 ${theme.rankBadge} ${isFirst && compact ? 'mt-1' : 'mt-5'}`}
          >
            <span
              className={`leading-none ${isFirst ? 'text-2xl' : 'text-lg'}`}
              aria-hidden
            >
              {theme.medal}
            </span>
            {theme.placementLabel}
          </div>

          <h2
            className={`mt-5 font-black tracking-tight text-white ${
              exportLayout
                ? isFirst
                  ? 'text-3xl'
                  : 'text-2xl'
                : isFirst
                  ? 'text-2xl sm:text-3xl'
                  : 'text-xl sm:text-2xl'
            }`}
          >
            {data.teamName || 'Team'}
          </h2>

          <dl className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-800/80 pt-5">
            <div>
              <dt className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">
                Points
              </dt>
              <dd className={`mt-1 text-lg font-black ${theme.accentText}`}>
                {formatPoints(data.totalPoints)}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">
                Kills
              </dt>
              <dd className="mt-1 text-lg font-black text-blue-200">
                {data.totalKills}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">
                Matches
              </dt>
              <dd className="mt-1 text-lg font-black text-slate-300">
                {data.matchesPlayed}
              </dd>
            </div>
          </dl>

          {!compact && (
            <p className="mt-5 text-[10px] font-semibold tracking-wide text-slate-600 uppercase">
              Tournament series · team standings
            </p>
          )}
        </div>
      </div>
    </div>
  )
})
