import { useMemo, useState } from 'react'
import {
  CLAN_TAG,
  combatRoles,
  formatCombatRole,
  leadershipSlotTitle,
  tiers,
  type LeadershipSlotTarget,
  type Soldier,
  type TierId,
} from '../data/clan'
import { useClan } from '../context/ClanContext'
import { assignLeadershipSlot } from '../lib/api'
import { GamingButton } from './GamingButton'
import { previewGamertag } from '../lib/gamertag'

type AssignLeadershipDialogProps = {
  slot: LeadershipSlotTarget
  currentHolder: Soldier | undefined
  soldiers: Soldier[]
  onClose: () => void
}

export function AssignLeadershipDialog({
  slot,
  currentHolder,
  soldiers,
  onClose,
}: AssignLeadershipDialogProps) {
  const { refreshSoldiers } = useClan()
  const [mode, setMode] = useState<'roster' | 'new'>('roster')
  const [soldierId, setSoldierId] = useState('')
  const [name, setName] = useState('')
  const [clanTitle, setClanTitle] = useState<
    'Leader' | 'Co-Leader' | 'Captain' | 'Elite' | 'Soldier'
  >('Leader')
  const [tier, setTier] = useState<TierId>('t2')
  const [combatRole, setCombatRole] =
    useState<(typeof combatRoles)[number]>('support')
  const [region, setRegion] = useState('CM')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const title = leadershipSlotTitle(slot)

  const rosterOptions = useMemo(() => {
    return [...soldiers].sort((a, b) =>
      a.gamertag.localeCompare(b.gamertag),
    )
  }, [soldiers])

  async function runAssign(clear?: boolean) {
    setBusy(true)
    setErr(null)
    try {
      const base =
        slot.rank === 'clan_coordinator'
          ? {
              rank: slot.rank as const,
              coordinatorIndex: slot.coordinatorIndex,
            }
          : { rank: slot.rank }

      if (clear) {
        await assignLeadershipSlot({ ...base, clear: true })
      } else if (mode === 'roster') {
        if (!soldierId) {
          setErr('Choose a soldier from the roster.')
          setBusy(false)
          return
        }
        await assignLeadershipSlot({ ...base, soldierId })
      } else {
        if (!name.trim()) {
          setErr('Enter a name for the new leader.')
          setBusy(false)
          return
        }
        await assignLeadershipSlot({
          ...base,
          newSoldier: {
            name: name.trim(),
            role: clanTitle,
            tier,
            combatRole,
            region,
          },
        })
      }
      await refreshSoldiers({ force: true })
      onClose()
    } catch (error) {
      setErr(
        error instanceof Error ? error.message : 'Could not update leadership',
      )
    } finally {
      setBusy(false)
    }
  }

  const preview = name.trim() ? previewGamertag(name) : `${CLAN_TAG}…`

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-blue-800/50 bg-slate-950 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-leadership-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-800 px-5 py-4">
          <p className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">
            Clan Master only
          </p>
          <h2
            id="assign-leadership-title"
            className="mt-1 text-lg font-black text-white"
          >
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Assign who appears on this hierarchy card. Saves to Supabase.
          </p>
        </div>

        <div className="space-y-4 p-5">
          {currentHolder && (
            <p className="rounded-lg bg-slate-900/80 px-3 py-2 text-sm text-slate-300">
              Current:{' '}
              <span className="font-bold text-blue-200">
                {currentHolder.gamertag}
              </span>
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              className={`btn-gaming btn-gaming-sm flex-1 ${
                mode === 'roster'
                  ? 'btn-gaming-primary'
                  : 'btn-gaming-secondary'
              }`}
              onClick={() => setMode('roster')}
            >
              <span className="relative z-10">From roster</span>
            </button>
            <button
              type="button"
              className={`btn-gaming btn-gaming-sm flex-1 ${
                mode === 'new' ? 'btn-gaming-primary' : 'btn-gaming-secondary'
              }`}
              onClick={() => setMode('new')}
            >
              <span className="relative z-10">Add new</span>
            </button>
          </div>

          {mode === 'roster' ? (
            <label className="block text-sm">
              <span className="text-slate-400">Soldier</span>
              <select
                value={soldierId}
                onChange={(e) => setSoldierId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white"
              >
                <option value="">Select…</option>
                {rosterOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.gamertag}
                    {s.id === currentHolder?.id ? ' (current)' : ''}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className="text-slate-400">Name (without tag)</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white"
                  placeholder="Gamertag"
                />
                <span className="mt-1 block text-xs text-blue-300/80">
                  → {preview}
                </span>
              </label>
              <label className="block text-sm">
                <span className="text-slate-400">Clan title</span>
                <select
                  value={clanTitle}
                  onChange={(e) =>
                    setClanTitle(
                      e.target.value as typeof clanTitle,
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white"
                >
                  <option value="Leader">Leader</option>
                  <option value="Co-Leader">Co-Leader</option>
                  <option value="Captain">Captain</option>
                  <option value="Elite">Elite</option>
                  <option value="Soldier">Soldier</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-slate-400">Tier</span>
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
              <label className="block text-sm">
                <span className="text-slate-400">Role</span>
                <select
                  value={combatRole}
                  onChange={(e) =>
                    setCombatRole(
                      e.target.value as (typeof combatRoles)[number],
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white"
                >
                  {combatRoles.map((r) => (
                    <option key={r} value={r}>
                      {formatCombatRole(r)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-slate-400">Region</span>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-white"
                />
              </label>
            </div>
          )}

          {err && (
            <p className="text-sm text-rose-400" role="alert">
              {err}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <GamingButton
              type="button"
              size="sm"
              disabled={busy}
              onClick={() => void runAssign(false)}
            >
              {busy ? 'Saving…' : 'Save slot'}
            </GamingButton>
            <GamingButton
              type="button"
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </GamingButton>
            {currentHolder && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void runAssign(true)}
                className="ml-auto rounded-lg border border-rose-900/60 px-4 py-2.5 text-sm font-semibold text-rose-300 hover:bg-rose-950/40"
              >
                Clear slot
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
