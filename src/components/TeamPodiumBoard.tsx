import { forwardRef } from 'react'
import { CLAN_NAME, CLAN_TAG } from '../data/clan'
import type { PodiumRank } from '../lib/teamPodiumTheme'
import { CameroonStripe } from './CameroonStripe'
import { PodiumChampionSpotlight } from './PodiumChampionSpotlight'
import {
  TeamPodiumCardFace,
  type TeamPodiumCardData,
} from './TeamPodiumCardFace'

export type PodiumSlot = {
  rank: PodiumRank
  data: TeamPodiumCardData
}

type TeamPodiumBoardProps = {
  slots: PodiumSlot[]
  /** Fixed layout for full-podium PNG export. */
  exportLayout?: boolean
  className?: string
}

/** Center column = 1st; left = 2nd; right = 3rd. */
const PODIUM_COLUMN_ORDER: PodiumRank[] = [2, 1, 3]

function riserClass(rank: PodiumRank, exportLayout: boolean): string {
  if (exportLayout) {
    if (rank === 1) return 'h-14'
    if (rank === 2) return 'h-8'
    return 'h-5'
  }
  if (rank === 1) return 'h-0 md:h-16'
  if (rank === 2) return 'h-0 md:h-9'
  return 'h-0 md:h-4'
}

const riserTone: Record<PodiumRank, string> = {
  1: 'bg-linear-to-b from-amber-400/35 via-amber-800/50 to-amber-950 ring-amber-500/30',
  2: 'bg-linear-to-b from-slate-300/25 via-slate-700/45 to-slate-950 ring-slate-400/25',
  3: 'bg-linear-to-b from-orange-600/30 via-orange-950/55 to-[#040810] ring-orange-700/30',
}

export const TeamPodiumBoard = forwardRef<HTMLDivElement, TeamPodiumBoardProps>(
  function TeamPodiumBoard(
    { slots, exportLayout = false, className = '' },
    ref,
  ) {
    const headline = slots[0]?.data.tournamentName ?? 'Tournament'
    const dateLabel = slots.find((s) => s.data.eventDateLabel)?.data
      .eventDateLabel

    const slotByRank = new Map(slots.map((s) => [s.rank, s]))
    const columns = PODIUM_COLUMN_ORDER.map((rank) => slotByRank.get(rank) ?? null)

    return (
      <div
        ref={ref}
        className={`relative overflow-visible rounded-3xl border border-amber-500/15 bg-[#04060e] shadow-[0_0_80px_rgba(251,191,36,0.12),0_0_40px_rgba(59,130,246,0.06)] ${exportLayout ? 'w-[1080px] px-10 py-10' : 'px-4 py-8 sm:px-8 sm:py-10'} ${className}`}
      >
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,rgba(59,130,246,0.14),transparent_55%)]" />
          <div className="podium-stage-vignette absolute inset-0 rounded-3xl" />
          <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-cm-green/60 to-transparent" />
        </div>

        <header className="relative text-center">
          <p className="text-[10px] font-bold tracking-[0.35em] text-blue-400 uppercase sm:text-xs">
            {CLAN_TAG} · {CLAN_NAME}
          </p>
          <CameroonStripe
            size="md"
            className="mx-auto mt-4 max-w-[8rem] sm:max-w-[10rem]"
          />
          <p className="mt-5 text-[11px] font-bold tracking-[0.3em] text-amber-400/90 uppercase">
            Podium
          </p>
          <h2
            className={`mt-2 font-black tracking-tight text-white ${exportLayout ? 'text-3xl' : 'text-2xl sm:text-3xl'}`}
          >
            {headline}
          </h2>
          {dateLabel && (
            <p className="mt-2 text-sm text-slate-500">{dateLabel}</p>
          )}
        </header>

        <div
          className={`relative mt-10 grid items-end gap-8 ${exportLayout ? 'grid-cols-3 gap-5' : 'grid-cols-1 md:mt-12 md:grid-cols-3 md:gap-5 lg:gap-6'}`}
        >
          {columns.map((slot, colIndex) => {
            if (!slot) {
              return (
                <div
                  key={`empty-${colIndex}`}
                  className="hidden min-h-[1px] md:block"
                  aria-hidden
                />
              )
            }

            const { rank, data } = slot
            const column = (
              <div
                className={`flex flex-col ${rank === 1 && !exportLayout ? 'md:-mt-4' : ''} ${rank === 1 ? 'podium-slot-champion' : 'podium-slot-dim'}`}
              >
                <TeamPodiumCardFace
                  rank={rank}
                  data={data}
                  featured={rank === 1}
                  exportLayout={exportLayout}
                  compact
                />
                <div
                  className={`-mt-px rounded-b-xl ring-1 ${riserClass(rank, exportLayout)} ${riserTone[rank]}`}
                  aria-hidden
                />
              </div>
            )

            const key = `${rank}-${data.teamName}`
            return rank === 1 ? (
              <PodiumChampionSpotlight key={key}>{column}</PodiumChampionSpotlight>
            ) : (
              <div key={key}>{column}</div>
            )
          })}
        </div>

        <p className="relative mt-8 text-center text-[10px] font-semibold tracking-[0.2em] text-slate-600 uppercase">
          Team series totals · kills + placement
        </p>
      </div>
    )
  },
)
