import { useState } from 'react'
import {
  formatCombatRole,
  formatTierLabel,
  getClanRankLabel,
  type Soldier,
} from '../data/clan'
import { useClan } from '../context/ClanContext'
import { AddSoldierForm } from './AddSoldierForm'
import { EditSoldierDialog } from './EditSoldierDialog'

export function AdminRosterManager() {
  const { soldiers } = useClan()
  const [editing, setEditing] = useState<Soldier | null>(null)

  return (
    <section className="mb-10 rounded-2xl border border-blue-900/40 bg-slate-900/60 p-6">
      <AddSoldierForm />

      <p className="mt-6 text-xs text-slate-500">
        Click a row to edit · changes save to Supabase.
      </p>

      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Gamertag</th>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {soldiers.map((s) => (
              <tr
                key={s.id}
                className="cursor-pointer border-t border-slate-800/80 transition hover:bg-blue-950/30"
                onClick={() => setEditing(s)}
              >
                <td className="px-4 py-3 font-mono font-bold text-blue-200">
                  {s.gamertag}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {getClanRankLabel(s.clanRank)}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {formatTierLabel(s.tier)}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {formatCombatRole(s.combatRole)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditSoldierDialog
          soldier={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  )
}
