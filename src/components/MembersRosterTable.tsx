import { SoldierPortrait } from './SoldierPortrait'
import {
  formatCombatRole,
  getClanRankLabel,
  formatTier,
  getTier,
  sortSoldiersByHierarchy,
  type ClanRank,
  type Soldier,
} from '../data/clan'

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

type MembersRosterTableProps = {
  soldiers: Soldier[]
  coordinators: [
    Soldier | undefined,
    Soldier | undefined,
    Soldier | undefined,
  ]
  /** Full desktop columns, no scroll clip — for PNG export. */
  exportLayout?: boolean
}

export function MembersRosterTable({
  soldiers,
  coordinators,
  exportLayout = false,
}: MembersRosterTableProps) {
  const sorted = [...soldiers].sort(sortSoldiersByHierarchy)

  const th = exportLayout
    ? 'bg-slate-950 px-4 py-3 text-xs font-semibold'
    : 'bg-slate-950 px-3 py-3 font-semibold sm:px-5 sm:py-4'
  const td = exportLayout
    ? 'px-4 py-3'
    : 'px-3 py-3 sm:px-5 sm:py-4'

  return (
    <table
      className={`w-full text-left text-sm ${exportLayout ? 'min-w-[820px]' : 'min-w-[640px] sm:min-w-[720px]'}`}
    >
      <thead className={exportLayout ? '' : 'sticky top-0 z-20'}>
        <tr
          className={`border-b border-slate-800 text-[10px] tracking-wide text-slate-400 uppercase sm:text-xs ${exportLayout ? '' : 'shadow-[0_4px_12px_rgba(0,0,0,0.45)]'}`}
        >
          <th className={th}>#</th>
          <th className={th}>Gamertag</th>
          <th className={th}>Rank</th>
          <th
            className={`${th} ${exportLayout ? '' : 'hidden md:table-cell'}`}
          >
            Title
          </th>
          <th className={th}>Tier</th>
          <th className={th}>Role</th>
          <th
            className={`${th} ${exportLayout ? '' : 'hidden sm:table-cell'}`}
          >
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
              className={`border-b border-slate-800/60 ${
                exportLayout ? '' : 'transition hover:bg-blue-950/25'
              } ${index % 2 === 0 ? 'bg-slate-950/20' : 'bg-transparent'} ${isLeader ? 'bg-blue-950/10' : ''}`}
            >
              <td className={td}>
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
              <td className={td}>
                <div className="flex items-center gap-3">
                  <SoldierPortrait
                    initials={member.avatar}
                    tierId={member.tier}
                    combatRole={member.combatRole}
                    size="sm"
                  />
                  <span
                    className={`font-bold text-white ${exportLayout ? '' : 'max-w-[8rem] truncate sm:max-w-none'}`}
                  >
                    {member.gamertag}
                  </span>
                </div>
              </td>
              <td className={td}>
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
              <td
                className={`text-slate-400 ${td} ${exportLayout ? '' : 'hidden md:table-cell'}`}
              >
                {member.role}
              </td>
              <td className={td}>
                <span className="font-semibold text-blue-300">
                  {formatTier(tier)}
                </span>
              </td>
              <td className={td}>
                <span className="rounded-md bg-slate-950 px-2 py-1 text-xs font-bold text-blue-200">
                  {formatCombatRole(member.combatRole)}
                </span>
              </td>
              <td
                className={`text-slate-400 ${td} ${exportLayout ? '' : 'hidden sm:table-cell'}`}
              >
                {member.region}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
