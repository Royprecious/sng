import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { GamingButton } from './GamingButton'

export function AuthButton() {
  const { authConfigured, session, canEdit, signInWithGoogle, loading } =
    useAuth()

  if (!authConfigured) return null

  if (loading) {
    return (
      <span className="text-xs text-slate-500">…</span>
    )
  }

  if (!session) {
    return (
      <GamingButton
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => void signInWithGoogle()}
      >
        Sign in
      </GamingButton>
    )
  }

  return (
    <Link
      to="/admin"
      className={`rounded-md px-2.5 py-2 text-xs font-semibold uppercase ${
        canEdit
          ? 'bg-blue-600/25 text-blue-300 ring-1 ring-blue-500/40'
          : 'border border-slate-600 text-slate-400'
      }`}
    >
      {canEdit ? 'Admin' : 'Account'}
    </Link>
  )
}
