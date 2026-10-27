import { useState } from 'react'
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
import { createSoldier } from '../lib/api'
import { GamingButton } from './GamingButton'
import { previewGamertag } from '../lib/gamertag'

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

type AddSoldierFormProps = {
  variant?: 'compact' | 'full'
  onAdded?: () => void
}

export function AddSoldierForm({
  variant = 'full',
  onAdded,
}: AddSoldierFormProps) {
  const { refreshSoldiers } = useClan()
  const [name, setName] = useState('')
  const [clanTitle, setClanTitle] =
    useState<(typeof clanTitleOptions)[number]>('Soldier')
  const [clanRank, setClanRank] = useState<ClanRank>('member')
  const [tier, setTier] = useState<TierId>('t5')
  const [combatRole, setCombatRole] = useState<CombatRole>('support')
  const [region, setRegion] = useState('CM')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    setErr(null)
    try {
      await createSoldier({
        name,
        role: clanTitle,
        clanRank,
        tier,
        combatRole,
        region,
      })
      const tag = previewGamertag(name)
      setName('')
      setMsg(`Recruited ${tag} — saved to Supabase.`)
      await refreshSoldiers()
      onAdded?.()
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Could not add soldier')
    } finally {
      setBusy(false)
    }
  }

  const preview = name.trim() ? previewGamertag(name) : `${CLAN_TAG}…`
  const compact = variant === 'compact'

  return (
    <div
      className={
        compact
          ? 'rounded-2xl border border-blue-800/40 bg-slate-900/70 p-5 sm:p-6'
          : ''
      }
    >
      {!compact && (
        <>
          <h2 className="text-lg font-black text-white">Add a soldier</h2>
          <p className="mt-1 text-sm text-slate-500">
            Type a name only we prepend{' '}
            <span className="font-bold text-blue-300">{CLAN_TAG}</span>.
          </p>
        </>
      )}
      {compact && (
        <div className="mb-4">
          <h2 className="text-base font-black text-white sm:text-lg">
            Recruit a soldier
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Clan Master & admins · saves as{' '}
            <span className="font-mono text-blue-300">{CLAN_TAG}name</span>
          </p>
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className={`grid gap-3 ${compact ? 'sm:grid-cols-2 lg:grid-cols-3' : 'mt-6 gap-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4 sm:grid-cols-2'}`}
      >
        <label
          className={
            compact ? 'block sm:col-span-2 lg:col-span-3' : 'block sm:col-span-2'
          }
        >
          <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            Name (without tag)
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="vortex"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            required
          />
          <span className="mt-1 block font-mono text-xs text-blue-400/90">
            Saves as: {preview}
          </span>
        </label>

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

        <label className={compact ? 'block sm:col-span-2' : 'block sm:col-span-2'}>
          <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            Region
          </span>
          <input
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white"
          />
        </label>

        <GamingButton
          type="submit"
          size="sm"
          disabled={busy}
          className={compact ? 'sm:col-span-2 lg:col-span-3' : 'sm:col-span-2'}
        >
          {busy ? 'Saving…' : 'Add to roster'}
        </GamingButton>
      </form>

      {msg && <p className="mt-3 text-sm text-emerald-400">{msg}</p>}
      {err && <p className="mt-3 text-sm text-red-400">{err}</p>}
    </div>
  )
}
