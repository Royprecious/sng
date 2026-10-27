import { useEffect, useState } from 'react'
import {
  AdminSetupPanel,
  AdminSignInPanel,
} from '../components/AdminSignInPanel'
import { AdminRosterManager } from '../components/AdminRosterManager'
import { AdminSessionBar } from '../components/AdminSessionBar'
import { AdminSignedInUsers } from '../components/AdminSignedInUsers'
import { GamingButton } from '../components/GamingButton'
import { PageHeader } from '../components/PageHeader'
import { PageShell } from '../components/PageShell'
import { CLAN_NAME } from '../data/clan'
import { useAuth } from '../context/AuthContext'
import {
  createInviteCode,
  listInviteCodes,
  redeemAdminCode,
  type InviteCode,
} from '../lib/api'

export function AdminPage() {
  const {
    authConfigured,
    session,
    email,
    role,
    canEdit,
    canManageRoster,
    isSuperAdmin,
    signInWithGoogle,
    signOut,
    refreshRole,
  } = useAuth()

  const [codeInput, setCodeInput] = useState('')
  const [redeemMsg, setRedeemMsg] = useState<string | null>(null)
  const [redeemErr, setRedeemErr] = useState<string | null>(null)
  const [invites, setInvites] = useState<InviteCode[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [generated, setGenerated] = useState<string | null>(null)

  useEffect(() => {
    if (!isSuperAdmin) return
    listInviteCodes()
      .then(setInvites)
      .catch(() => setInvites([]))
  }, [isSuperAdmin])

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault()
    setRedeemMsg(null)
    setRedeemErr(null)
    try {
      const res = await redeemAdminCode(codeInput)
      setRedeemMsg(res.message)
      setCodeInput('')
      await refreshRole()
    } catch (err) {
      setRedeemErr(err instanceof Error ? err.message : 'Redeem failed')
    }
  }

  async function handleCreateCode(e: React.FormEvent) {
    e.preventDefault()
    setGenerated(null)
    try {
      const row = await createInviteCode({
        label: newLabel || undefined,
        maxUses: 1,
        expiresInDays: 30,
      })
      setGenerated(row.code)
      setNewLabel('')
      const list = await listInviteCodes()
      setInvites(list)
    } catch (err) {
      setRedeemErr(err instanceof Error ? err.message : 'Could not create code')
    }
  }

  if (!authConfigured) {
    return (
      <PageShell>
        <AdminSetupPanel>
          Add <code className="text-blue-400">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-blue-400">VITE_SUPABASE_ANON_KEY</code> (or{' '}
          <code className="text-blue-400">VITE_SUPABASE_PUBLISHABLE_KEY</code>{' '}
          ) to a root <code className="text-blue-400">.env</code> file, enable
          Google in Supabase Auth, then restart the dev server.
        </AdminSetupPanel>
      </PageShell>
    )
  }

  if (!session) {
    return (
      <div className="page-shell mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-8">
        <AdminSignInPanel onSignIn={() => void signInWithGoogle()} />
      </div>
    )
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Dashboard" title="Admin console">
        Manage access, invite codes, and tournament permissions for {CLAN_NAME}.
      </PageHeader>

      <AdminSessionBar
        email={email ?? ''}
        role={role}
        canEdit={canEdit}
        isSuperAdmin={isSuperAdmin}
        onSignOut={() => void signOut()}
      />

      {isSuperAdmin && <AdminSignedInUsers />}

      {canManageRoster && <AdminRosterManager />}

      {session && !canEdit && (
        <form
          onSubmit={handleRedeem}
          className="mb-10 max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg"
        >
          <h2 className="text-lg font-black text-white">Redeem admin code</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter the code from the Clan Master to unlock editing.
          </p>
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="e.g. A1B2C3D4"
            className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 font-mono text-white uppercase ring-blue-500/0 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <GamingButton type="submit" size="sm" className="mt-3">
            Redeem code
          </GamingButton>
          {redeemMsg && (
            <p className="mt-2 text-sm text-emerald-400">{redeemMsg}</p>
          )}
          {redeemErr && (
            <p className="mt-2 text-sm text-red-400">{redeemErr}</p>
          )}
        </form>
      )}

      {isSuperAdmin && (
        <section className="space-y-6">
          <form
            onSubmit={handleCreateCode}
            className="max-w-lg rounded-2xl border border-cm-yellow/30 bg-gradient-to-br from-slate-900/90 to-cm-yellow/5 p-6 shadow-lg"
          >
            <h2 className="font-black text-cm-yellow">
              Create admin invite code
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Share this one-time code with a clan leader. They sign in with
              Google, then redeem it here.
            </p>
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Label (optional, e.g. Coordinator NH)"
              className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white focus:border-cm-yellow/50 focus:outline-none focus:ring-2 focus:ring-cm-yellow/20"
            />
            <button
              type="submit"
              className="mt-3 rounded-lg bg-cm-yellow/90 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-cm-yellow"
            >
              Generate code
            </button>
            {generated && (
              <p className="mt-4 font-mono text-2xl font-black tracking-widest text-white">
                {generated}
              </p>
            )}
          </form>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Label</th>
                  <th className="px-4 py-3">Uses</th>
                  <th className="px-4 py-3">Expires</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-slate-800/80 transition hover:bg-slate-950/40"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-blue-300">
                      {row.code}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {row.label ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {row.use_count}/{row.max_uses}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {row.expires_at
                        ? new Date(row.expires_at).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {isSuperAdmin && (
        <p className="rounded-xl border border-cm-yellow/30 bg-cm-yellow/5 px-4 py-3 text-sm text-cm-yellow">
          You are Clan Master (super admin) — invite codes, roster add/remove,
          and tournament edits are all unlocked.
        </p>
      )}

      {canEdit && !isSuperAdmin && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-400">
          You have admin access manage the roster above and tournament data on
          the Tournament page.
        </p>
      )}
    </PageShell>
  )
}
