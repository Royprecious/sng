import { useState } from 'react'
import { AssignLeadershipDialog } from '../components/AssignLeadershipDialog'
import { EmptyRosterMessage } from '../components/EmptyRosterMessage'
import { LeadershipPyramid } from '../components/LeadershipPyramid'
import { SoldierPortrait } from '../components/SoldierPortrait'
import { PageHeader } from '../components/PageHeader'
import { PageShell } from '../components/PageShell'
import {
  CLAN_NAME,
  formatCombatRole,
  getClanRankLabel,
  formatTier,
  getLeadershipSlotHolders,
  getTier,
  sortSoldiersByHierarchy,
  type ClanRank,
  type LeadershipSlotTarget,
  type Soldier,
} from '../data/clan'
import { useAuth } from '../context/AuthContext'
import { useClan } from '../context/ClanContext'

const rankBadgeStyles: Record<ClanRank, string> = {
  clan_master:
    'bg-linear-to-r from-cm-yellow/25 to-amber-600/20 text-cm-yellow ring-cm-yellow/45 shadow-[0_0_12px_rgba(252,209,22,0.15)]',
  clan_mistress:
    'bg-linear-to-r from-cm-red/20 to-rose-900/30 text-rose-100 ring-cm-red/40',
  vice_clan_master:
    'bg-blue-600/25 text-blue-100 ring-blue-500/45',
  clan_coordinator:
    'bg-cm-green/20 text-emerald-100 ring-cm-green/40',
  member: 'bg-slate-800/80 text-slate-300 ring-slate-600/80',
}

const leadershipRanks: ClanRank[] = [
  'clan_master',
  'clan_mistress',
  'vice_clan_master',
  'clan_coordinator',
]

function holderForSlot(
  slot: LeadershipSlotTarget,
  holders: ReturnType<typeof getLeadershipSlotHolders>,
): Soldier | undefined {
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
  const sorted = [...soldiers].sort(sortSoldiersByHierarchy)
  const holders = getLeadershipSlotHolders(soldiers)
  const { master, mistress, vice, coordinators } = holders

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
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/50 shadow-[0_20px_50px_rgba(0,0,0,0.35)] ring-1 ring-blue-900/30">
          <div className="cm-card-top h-1 w-full" />
          <div className="relative">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-linear-to-t from-slate-900 to-transparent" />
            <div className="roster-table-scroll max-h-[min(28rem,55vh)] overflow-auto sm:max-h-[min(32rem,60vh)]">
              <table className="w-full min-w-[640px] text-left text-sm sm:min-w-[720px]">
                <thead className="sticky top-0 z-20">
                  <tr className="border-b border-slate-800 text-[10px] tracking-wide text-slate-400 uppercase shadow-[0_4px_12px_rgba(0,0,0,0.45)] sm:text-xs">
                    <th className="bg-slate-950 px-3 py-3 font-semibold sm:px-5 sm:py-4">
                      #
                    </th>
                    <th className="bg-slate-950 px-3 py-3 font-semibold sm:px-5 sm:py-4">
                      Gamertag
                    </th>
                    <th className="bg-slate-950 px-3 py-3 font-semibold sm:px-5 sm:py-4">
                      Rank
                    </th>
                    <th className="hidden bg-slate-950 px-5 py-4 font-semibold md:table-cell">
                      Title
                    </th>
                    <th className="bg-slate-950 px-3 py-3 font-semibold sm:px-5 sm:py-4">
                      Tier
                    </th>
                    <th className="bg-slate-950 px-3 py-3 font-semibold sm:px-5 sm:py-4">
                      Role
                    </th>
                    <th className="hidden bg-slate-950 px-5 py-4 font-semibold sm:table-cell">
                      Region
                    </th>
                  </tr>
                </thead>
              <tbody>
                {sorted.map((member, index) => {
                  const tier = getTier(member.tier)
                  const isLeader = leadershipRanks.includes(member.clanRank)
                  return (
                    <tr
                      key={member.id}
                      className={`border-b border-slate-800/60 transition hover:bg-blue-950/25 ${
                        index % 2 === 0 ? 'bg-slate-950/20' : 'bg-transparent'
                      } ${isLeader ? 'bg-blue-950/10' : ''}`}
                    >
                      <td className="px-3 py-3 sm:px-5 sm:py-4">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${
                            index < 3
                              ? 'bg-blue-600/30 text-blue-200'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-5 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <SoldierPortrait
                            initials={member.avatar}
                            tierId={member.tier}
                            combatRole={member.combatRole}
                            size="sm"
                          />
                          <span className="max-w-[8rem] truncate font-bold text-white sm:max-w-none">
                            {member.gamertag}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-5 sm:py-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${rankBadgeStyles[member.clanRank]}`}
                        >
                          {getClanRankLabel(member.clanRank)}
                          {member.clanRank === 'clan_coordinator' &&
                            (() => {
                              const idx = coordinators.findIndex(
                                (c) => c?.id === member.id,
                              )
                              return idx >= 0 ? ` ${idx + 1}` : ''
                            })()}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 text-slate-400 md:table-cell">
                        {member.role}
                      </td>
                      <td className="px-3 py-3 sm:px-5 sm:py-4">
                        <span className="font-semibold text-blue-300">
                          {formatTier(tier)}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-5 sm:py-4">
                        <span className="rounded-md bg-slate-950 px-2 py-1 text-xs font-bold text-blue-200">
                          {formatCombatRole(member.combatRole)}
                        </span>
                      </td>
                      <td className="hidden px-5 py-4 text-slate-400 sm:table-cell">
                        {member.region}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      )}
        </>
      )}
    </PageShell>
  )
}
