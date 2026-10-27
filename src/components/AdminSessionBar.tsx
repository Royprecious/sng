import type { UserRole } from '../context/AuthContext'

type AdminSessionBarProps = {
  email: string
  role: UserRole
  canEdit: boolean
  isSuperAdmin: boolean
  onSignOut: () => void
}

export function AdminSessionBar({
  email,
  role,
  canEdit,
  isSuperAdmin,
  onSignOut,
}: AdminSessionBarProps) {
  const initial = (email[0] ?? '?').toUpperCase()

  return (
    <div className="mb-10 flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white ring-2 ${
            isSuperAdmin
              ? 'bg-gradient-to-br from-cm-yellow/80 to-amber-600 ring-cm-yellow/40'
              : canEdit
                ? 'bg-gradient-to-br from-blue-600 to-blue-800 ring-blue-500/40'
                : 'bg-slate-800 ring-slate-600'
          }`}
        >
          {initial}
        </div>
        <div>
          <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Signed in
          </p>
          <p className="font-semibold text-white">{email}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
              isSuperAdmin
                ? 'bg-cm-yellow/20 text-cm-yellow'
                : canEdit
                  ? 'bg-blue-600/30 text-blue-200'
                  : 'bg-slate-700 text-slate-300'
            }`}
          >
            {role.replace('_', ' ')}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-400 transition hover:border-red-500/50 hover:bg-red-950/30 hover:text-red-300"
      >
        Sign out
      </button>
    </div>
  )
}
