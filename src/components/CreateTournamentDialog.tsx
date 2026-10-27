import { useState, type FormEvent } from 'react'
import { createTournament, type TournamentPayload } from '../lib/api'
import { GamingButton } from './GamingButton'

type CreateTournamentDialogProps = {
  onClose: () => void
  onCreated: (tournament: TournamentPayload) => void
}

function todayIsoDate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Store prize pool with FCFA label (Cameroon / XAF). */
function formatPrizePoolFcfa(raw: string): string | undefined {
  const trimmed = raw.trim()
  if (!trimmed) return undefined
  const digits = trimmed.replace(/\s/g, '').replace(/,/g, '').replace(/\./g, '')
  const withoutCurrency = digits.replace(/fcfa/gi, '').replace(/xaf/gi, '')
  if (/^\d+$/.test(withoutCurrency)) {
    const n = Number(withoutCurrency)
    return `${n.toLocaleString('fr-FR')} FCFA`
  }
  if (/fcfa/i.test(trimmed)) return trimmed
  return `${trimmed} FCFA`
}

export function CreateTournamentDialog({
  onClose,
  onCreated,
}: CreateTournamentDialogProps) {
  const [name, setName] = useState('')
  const [eventDate, setEventDate] = useState(todayIsoDate)
  const [prizePool, setPrizePool] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setErr('Enter a tournament name.')
      return
    }
    setBusy(true)
    setErr(null)
    try {
      const created = await createTournament({
        name: name.trim(),
        eventDate: eventDate.trim() || undefined,
        prizePool: formatPrizePoolFcfa(prizePool),
      })
      onCreated(created)
      onClose()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not create tournament.'
      setErr(
        msg.includes('event_date') || msg.includes('schema cache')
          ? `${msg} Open Supabase → SQL → New query, paste the contents of supabase/migrations/007_tournament_schema_fix.sql, click Run, wait 30 seconds, restart npm run dev:server, then try again.`
          : msg,
      )
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-emerald-800/50 bg-slate-950 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-tournament-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-800 px-5 py-4">
          <p className="text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase">
            New event
          </p>
          <h2
            id="create-tournament-title"
            className="mt-1 text-lg font-black text-white"
          >
            Create tournament
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Name the event, set the date, and prize pool in FCFA. You can add
            matches and scoring after it is created.
          </p>
        </div>

        <form className="space-y-4 p-5" onSubmit={(e) => void handleSubmit(e)}>
          <label className="block">
            <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Tournament name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-white outline-none focus:border-emerald-500"
              placeholder="e.g. SNG Spring Showdown"
              autoFocus
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Date
            </span>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-white outline-none focus:border-emerald-500"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Prize pool (FCFA)
            </span>
            <div className="mt-1 flex overflow-hidden rounded-lg border border-slate-700 bg-slate-900 focus-within:border-emerald-500">
              <input
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
                inputMode="numeric"
                className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 font-semibold text-white outline-none"
                placeholder="e.g. 50 000"
                aria-describedby="prize-pool-fcfa-hint"
              />
              <span className="flex items-center border-l border-slate-700 bg-slate-950/80 px-3 text-sm font-bold text-amber-200/90">
                FCFA
              </span>
            </div>
            <p id="prize-pool-fcfa-hint" className="mt-1 text-xs text-slate-500">
              Central African CFA franc (same currency as Cameroon).
            </p>
          </label>

          {err && (
            <p className="text-sm font-semibold text-red-400" role="alert">
              {err}
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <GamingButton
              type="submit"
              variant="primary"
              disabled={busy}
              className="flex-1 sm:flex-none"
            >
              {busy ? 'Creating…' : 'Create tournament'}
            </GamingButton>
            <GamingButton
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={onClose}
            >
              Cancel
            </GamingButton>
          </div>
        </form>
      </div>
    </div>
  )
}
