import { useEffect, useState } from 'react'
import type { Soldier } from '../data/clan'
import {
  CLAN_TAG,
  combatRoles,
  formatCombatRole,
  getClanRankLabel,
  tiers,
  type ClanRank,
  type CombatRole,
  type TierId,
} from '../data/clan'
import { useClan } from '../context/ClanContext'
import { deleteSoldier, updateSoldier } from '../lib/api'
import { GamingButton } from './GamingButton'
import { nameWithoutClanTag, previewGamertag } from '../lib/gamertag'

const clanTitleOptions = [
  'Leader',
  'Co-Leader',
  'Captain',
  'Elite',
  'Soldier',
] as const
const rankOptions: ClanRank[] = [
  'clan_master',
  'clan_mistress',
  'vice_clan_master',
  'clan_coordinator',
  'member',
]

type EditSoldierDialogProps = {
  soldier: Soldier
  onClose: () => void
}

export function EditSoldierDialog({ soldier, onClose }: EditSoldierDialogProps) {
  const { refreshSoldiers } = useClan()
  const [name, setName] = useState(nameWithoutClanTag(soldier.gamertag))
  const [clanTitle, setClanTitle] = useState<(typeof clanTitleOptions)[number]>(
    soldier.role,
  )
  const [clanRank, setClanRank] = useState<ClanRank>(soldier.clanRank)
  const [tier, setTier] = useState<TierId>(soldier.tier)
  const [combatRole, setCombatRole] = useState<CombatRole>(soldier.combatRole)
  const [region, setRegion] = useState(soldier.region)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    setName(nameWithoutClanTag(soldier.gamertag))
    setClanTitle(soldier.role)
    setClanRank(soldier.clanRank)
    setTier(soldier.tier)
    setCombatRole(soldier.combatRole)
    setRegion(soldier.region)
  }, [soldier])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      await updateSoldier(soldier.id, {
        name,
        role: clanTitle,
        clanRank,
        tier,
        combatRole,
        region,
      })
      await refreshSoldiers({ force: true })
      onClose()
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (
      !window.confirm(
        `Remove ${soldier.gamertag} from the roster? This cannot be undone.`,
      )
    ) {
      return
    }
    setBusy(true)
    setErr(null)
    try {
      await deleteSoldier(soldier.id)
      await refreshSoldiers({ force: true })
      onClose()
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Delete failed')
      setBusy(false)
    }
  }

  const preview = name.trim() ? previewGamertag(name) : `${CLAN_TAG}…`

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-soldier-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-blue-800/50 bg-slate-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
          <h2
            id="edit-soldier-title"
            className="text-lg font-black text-white"
          >
            Edit soldier
          </h2>
          <p className="mt-1 font-mono text-sm text-blue-300">
            {soldier.gamertag}
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 p-5 sm:p-6">
          <label className="block">
            <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
              Name (without tag)
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              required
            />
            <span className="mt-1 block font-mono text-xs text-blue-400/90">
              Saves as: {preview}
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                Clan title
              </span>
              <select
                value={clanTitle}
                onChange={(e) =>
                  setClanTitle(e.target.value as (typeof clanTitleOptions)[number])
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white"
              >
                {clanTitleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                Clan rank
              </span>
              <select
                value={clanRank}
                onChange={(e) => setClanRank(e.target.value as ClanRank)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white"
              >
                {rankOptions.map((r) => (
                  <option key={r} value={r}>
                    {getClanRankLabel(r)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                Tier
              </span>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as TierId)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white"
              >
                {tiers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
                Role
              </span>
              <select
                value={combatRole}
                onChange={(e) => setCombatRole(e.target.value as CombatRole)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white"
              >
                {combatRoles.map((r) => (
                  <option key={r} value={r}>
                    {formatCombatRole(r)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
              Region
            </span>
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white"
            />
          </label>

          {err && <p className="text-sm text-red-400">{err}</p>}

          <div className="flex flex-wrap gap-3 pt-2">
            <GamingButton type="submit" size="sm" disabled={busy}>
              {busy ? 'Saving…' : 'Save changes'}
            </GamingButton>
            <GamingButton
              type="button"
              size="sm"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </GamingButton>
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={busy}
              className="ml-auto text-sm font-bold text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              Remove soldier
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
