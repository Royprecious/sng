import { forwardRef } from 'react'
import { CLAN_NAME, CLAN_TAG, type Soldier } from '../data/clan'
import { CameroonStripe } from './CameroonStripe'
import { MembersRosterTable } from './MembersRosterTable'

type MembersRosterExportSheetProps = {
  soldiers: Soldier[]
  coordinators: [
    Soldier | undefined,
    Soldier | undefined,
    Soldier | undefined,
  ]
}

export const MembersRosterExportSheet = forwardRef<
  HTMLDivElement,
  MembersRosterExportSheetProps
>(function MembersRosterExportSheet({ soldiers, coordinators }, ref) {
  const count = soldiers.length
  const exportedOn = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div
      ref={ref}
      className="w-[900px] shrink-0 overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/95 shadow-[0_20px_50px_rgba(0,0,0,0.45)] ring-1 ring-blue-900/30"
    >
      <CameroonStripe size="md" className="h-1 w-full rounded-none" />
      <RosterExportTopBar count={count} exportedOn={exportedOn} />
      <div className="border-b border-slate-800/80 bg-slate-950/80 px-8 py-5">
        <p className="text-[10px] font-bold tracking-[0.35em] text-blue-400 uppercase">
          Command structure
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
          Clan members & hierarchy
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Official {CLAN_NAME} roster snapshot · {count} operators · sorted by
          rank & tier
        </p>
      </div>
      <div className="px-4 pb-6 pt-4">
        <MembersRosterTable
          soldiers={soldiers}
          coordinators={coordinators}
          exportLayout
        />
      </div>
      <footer className="border-t border-slate-800 bg-slate-950/90 px-8 py-4 text-center">
        <p className="text-[10px] font-bold tracking-[0.25em] text-slate-500 uppercase">
          Cod mobile · {CLAN_TAG} · {exportedOn}
        </p>
      </footer>
    </div>
  )
})

function RosterExportTopBar({
  count,
  exportedOn,
}: {
  count: number
  exportedOn: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800/60 bg-slate-950/50 px-8 py-3">
      <span className="text-sm font-black text-white">
        {CLAN_NAME}{' '}
        <span className="text-blue-400">{CLAN_TAG}</span>
      </span>
      <span className="rounded-full bg-emerald-950/80 px-3 py-1 text-[10px] font-bold tracking-wider text-emerald-300 uppercase ring-1 ring-emerald-500/30">
        Roster snapshot · {count} members
      </span>
      <span className="text-xs text-slate-500">{exportedOn}</span>
    </div>
  )
}
