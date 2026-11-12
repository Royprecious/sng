import { useRef, useState } from 'react'
import { AssignLeadershipDialog } from '../components/AssignLeadershipDialog'
import { EmptyRosterMessage } from '../components/EmptyRosterMessage'
import { GamingButton } from '../components/GamingButton'
import { LeadershipPyramid } from '../components/LeadershipPyramid'
import { MembersRosterExportSheet } from '../components/MembersRosterExportSheet'
import { MembersRosterTable } from '../components/MembersRosterTable'
import { PageHeader } from '../components/PageHeader'
import { PageShell } from '../components/PageShell'
import {
  CLAN_NAME,
  getLeadershipSlotHolders,
  sortSoldiersByHierarchy,
  type LeadershipSlotTarget,
} from '../data/clan'
import { useAuth } from '../context/AuthContext'
import { useClan } from '../context/ClanContext'
import { downloadCardPng } from '../lib/exportMemberCardPng'

function holderForSlot(
  slot: LeadershipSlotTarget,
  holders: ReturnType<typeof getLeadershipSlotHolders>,
) {
  if (slot.rank === 'clan_master') return holders.master
  if (slot.rank === 'clan_mistress') return holders.mistress
  if (slot.rank === 'vice_clan_master') return holders.vice
  return holders.coordinators[slot.coordinatorIndex]
}

export function MembersPage() {
  const { soldiers, loading } = useClan()
  const { isSuperAdmin } = useAuth()
  const [assignSlot, setAssignSlot] = useState<LeadershipSlotTarget | null>(
    null,
  )
  const exportRef = useRef<HTMLDivElement>(null)
  const [exportBusy, setExportBusy] = useState(false)
  const [exportHint, setExportHint] = useState<string | null>(null)

  const sorted = [...soldiers].sort(sortSoldiersByHierarchy)
  const holders = getLeadershipSlotHolders(soldiers)
  const { master, mistress, vice, coordinators } = holders

  async function exportRosterPng() {
    const node = exportRef.current
    if (!node || exportBusy || soldiers.length === 0) return
    setExportBusy(true)
    setExportHint(null)
    try {
      const stamp = new Date().toISOString().slice(0, 10)
      await downloadCardPng(node, `members-roster-${stamp}`)
      setExportHint('Roster PNG downloaded')
    } catch (err) {
      setExportHint(
        err instanceof Error ? err.message : 'Could not export roster',
      )
    } finally {
      setExportBusy(false)
      window.setTimeout(() => setExportHint(null), 5000)
    }
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Command structure" title="Clan members & hierarchy">
        Official {CLAN_NAME} leadership chain Clan Master through three Clan
        Coordinators plus the full member roster in one table.
      </PageHeader>

      {loading && (
        <p className="mb-8 text-sm text-slate-500">Loading roster…</p>
      )}

      {!loading && (
        <>
          <section className="mb-10 sm:mb-16">
            <LeadershipPyramid
              master={master}
              mistress={mistress}
              vice={vice}
              coordinators={coordinators}
              canAssign={isSuperAdmin}
              onAssignSlot={setAssignSlot}
            />
            {isSuperAdmin && assignSlot && (
              <AssignLeadershipDialog
                slot={assignSlot}
                currentHolder={holderForSlot(assignSlot, holders)}
                soldiers={soldiers}
                onClose={() => setAssignSlot(null)}
              />
            )}
          </section>

          {!loading && soldiers.length === 0 && !isSuperAdmin && (
            <EmptyRosterMessage className="mb-10" />
          )}

          {soldiers.length > 0 && (
            <section>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold tracking-[0.2em] text-blue-400 uppercase">
                    Full roster
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {sorted.length} operators · sorted by rank & tier
                  </p>
                </div>
                {isSuperAdmin && (
                  <div className="flex flex-col items-end gap-1">
                    <GamingButton
                      type="button"
                      size="sm"
                      disabled={exportBusy}
                      onClick={() => void exportRosterPng()}
                      className="touch-manipulation"
                    >
                      {exportBusy ? 'Exporting…' : 'Download roster PNG'}
                    </GamingButton>
                    <p className="max-w-[14rem] text-right text-[10px] text-slate-500">
                      Full table snapshot for WhatsApp, Discord, or archives
                    </p>
                    {exportHint && (
                      <p className="text-xs font-semibold text-emerald-400">
                        {exportHint}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/50 shadow-[0_20px_50px_rgba(0,0,0,0.35)] ring-1 ring-blue-900/30">
                <div className="cm-card-top h-1 w-full" />
                <div className="relative">
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-linear-to-t from-slate-900 to-transparent" />
                  <div className="roster-table-scroll max-h-[min(28rem,55vh)] overflow-auto sm:max-h-[min(32rem,60vh)]">
                    <MembersRosterTable
                      soldiers={soldiers}
                      coordinators={coordinators}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {isSuperAdmin && soldiers.length > 0 && (
            <div className="export-capture-host" aria-hidden inert>
              <MembersRosterExportSheet
                ref={exportRef}
                soldiers={soldiers}
                coordinators={coordinators}
              />
            </div>
          )}
        </>
      )}
    </PageShell>
  )
}
