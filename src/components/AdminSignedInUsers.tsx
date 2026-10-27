import { useCallback, useEffect, useState } from 'react'
import { fetchSignedInUsers, type AuthUserRow } from '../lib/api'

const REFRESH_MS = 45_000

export function AdminSignedInUsers() {
  const [users, setUsers] = useState<AuthUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const rows = await fetchSignedInUsers()
      setUsers(rows)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const t = window.setInterval(() => void load(), REFRESH_MS)
    return () => window.clearInterval(t)
  }, [load])

  const onlineCount = users.filter((u) => u.online).length

  return (
    <section className="mb-10 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-cm-yellow">
            Signed-in accounts
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Clan Master only — Google emails for everyone who has signed in.{' '}
            <span className="text-emerald-400/90">Green</span> = active in the
            last 5 minutes.
          </p>
        </div>
        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-slate-400">
          {onlineCount} online · {users.length} total
        </span>
      </div>

      {loading && (
        <p className="mt-6 text-sm text-slate-500">Loading accounts…</p>
      )}
      {error && (
        <p className="mt-6 text-sm text-red-400">{error}</p>
      )}

      {!loading && !error && users.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">
          No accounts yet — sign in to create your profile.
        </p>
      )}

      {!loading && users.length > 0 && (
        <ul className="mt-6 space-y-2">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-950/50 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    user.online
                      ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                      : 'bg-slate-600'
                  }`}
                  title={user.online ? 'Online now' : 'Offline'}
                />
                <span className="truncate font-medium text-white">
                  {user.email}
                </span>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  user.role === 'super_admin'
                    ? 'bg-cm-yellow/20 text-cm-yellow'
                    : user.role === 'admin'
                      ? 'bg-blue-600/30 text-blue-200'
                      : 'bg-slate-700 text-slate-300'
                }`}
              >
                {user.role.replace('_', ' ')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
