import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AddSoldierForm } from '../components/AddSoldierForm'
import { EditSoldierDialog } from '../components/EditSoldierDialog'
import { EmptyRosterMessage } from '../components/EmptyRosterMessage'
import { PageHeader } from '../components/PageHeader'
import { PageShell } from '../components/PageShell'
import { SngMemberCard } from '../components/SngMemberCard'
import { CLAN_NAME, CLAN_TAG, type Soldier } from '../data/clan'
import { useAuth } from '../context/AuthContext'
import { useClan } from '../context/ClanContext'

export function SoldiersPage() {
  const { soldiers, loading } = useClan()
  const {
    session,
    canManageRoster,
    isSuperAdmin,
    authConfigured,
    loading: authLoading,
  } = useAuth()

  const rosterEmpty = !loading && soldiers.length === 0
  const authReady = authConfigured && !authLoading
  const [editing, setEditing] = useState<Soldier | null>(null)

  return (
    <PageShell>
      <PageHeader eyebrow="Roster" title="Our soldiers">
        Cameroon-born and diaspora operators repping {CLAN_NAME} (
        <span className="font-bold text-blue-300">{CLAN_TAG}</span>
        ). Each operator gets a shareable member card save or share from your
        phone.
      </PageHeader>

      {authReady && canManageRoster && (
        <div className="mb-10">
          {isSuperAdmin && (
            <p className="mb-3 text-xs font-bold tracking-wide text-cm-yellow uppercase">
              Clan Master — full roster control
            </p>
          )}
          <AddSoldierForm variant="compact" />
        </div>
      )}

      {authReady &&
        session &&
        !canManageRoster &&
        !rosterEmpty && (
          <p className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
            Only clan admins and the Clan Master can add soldiers.{' '}
            <Link
              to="/admin"
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              Admin
            </Link>{' '}
            · redeem an invite code for edit access.
          </p>
        )}

      {loading && (
        <p className="mb-6 text-sm text-slate-500">Loading roster…</p>
      )}

      {rosterEmpty && (
        <EmptyRosterMessage
          className="mb-8"
          description={
            canManageRoster
              ? 'Use the form above to add your first recruit — everyone will see them here.'
              : 'The clan roster is empty. Check back once leadership adds members.'
          }
        />
      )}

      {!rosterEmpty && (
        <>
          {canManageRoster && (
            <p className="mb-4 text-xs text-slate-500">
              Tap a soldier card to update their profile.
            </p>
          )}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-2 xl:grid-cols-3">
            {soldiers.map((s) => (
              <SngMemberCard
                key={s.id}
                soldier={s}
                editable={canManageRoster}
                onEdit={setEditing}
              />
            ))}
          </div>
        </>
      )}

      {editing && (
        <EditSoldierDialog
          soldier={editing}
          onClose={() => setEditing(null)}
        />
      )}
    </PageShell>
  )
}
