import { forwardRef } from 'react'
import { CLAN_NAME, CLAN_TAG } from '../data/clan'
import { CameroonStripe } from './CameroonStripe'

export type TeamRosterShareCardData = {
  teamName: string
  matchLabel: string
  tournamentName?: string
  players: string[]
}

type TeamRosterShareCardProps = {
  data: TeamRosterShareCardData
  exportLayout?: boolean
}

export const TeamRosterShareCard = forwardRef<
  HTMLDivElement,
  TeamRosterShareCardProps
>(function TeamRosterShareCard({ data, exportLayout = false }, ref) {
  const title = data.teamName.trim() || 'Team roster'
  const roster = data.players.filter((n) => n.trim())

  return (
    <div
      ref={ref}
      className={
        exportLayout
          ? 'w-[400px] rounded-2xl border border-blue-800/50 bg-[#040810] p-px shadow-2xl'
          : 'mx-auto w-full max-w-sm rounded-2xl border border-blue-800/50 bg-[#040810] p-px shadow-xl'
      }
    >
      <div
        className={`relative overflow-hidden rounded-[calc(1rem-1px)] bg-linear-to-b from-slate-900 via-slate-950 to-[#040810] ${exportLayout ? 'px-7 py-8' : 'px-5 py-6'}`}
      >
        <CameroonStripe size="md" className="absolute inset-x-0 top-0 rounded-none" />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            backgroundImage:
              'linear-gradient(rgba(59,130,246,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.08)_1px,transparent_1px)',
            backgroundSize: '20px 20px',
          }}
        />

        <header className="relative text-center">
          <p className="text-[10px] font-bold tracking-[0.35em] text-blue-400 uppercase">
            {CLAN_TAG} · {CLAN_NAME}
          </p>
          {data.tournamentName ? (
            <p className="mt-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
              {data.tournamentName}
            </p>
          ) : null}
          <p className="mt-1 text-[10px] font-bold tracking-[0.2em] text-emerald-400/90 uppercase">
            {data.matchLabel}
          </p>
          <h2
            className={`mt-4 font-black tracking-tight text-white ${exportLayout ? 'text-3xl' : 'text-2xl'}`}
          >
            {title}
          </h2>
          <CameroonStripe
            size="sm"
            className="mx-auto mt-4 max-w-[7rem] rounded-full"
          />
        </header>

        <div className="relative mt-6 rounded-xl border border-slate-800 bg-slate-950/80 p-4">
          <p className="text-[10px] font-bold tracking-[0.25em] text-slate-500 uppercase">
            Squad
          </p>
          {roster.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No players assigned yet.</p>
          ) : (
            <ol className="mt-3 space-y-2.5">
              {roster.map((name, i) => (
                <li
                  key={`${name}-${i}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-2.5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-600/25 text-xs font-black text-blue-200">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-left text-base font-bold text-white">
                    {name}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <p className="relative mt-5 text-center text-[9px] font-semibold tracking-[0.18em] text-slate-600 uppercase">
          Same clan · same grind · one team
        </p>
      </div>
    </div>
  )
})
