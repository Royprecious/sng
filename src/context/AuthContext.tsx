import type { Session } from '@supabase/supabase-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchAuthMe,
  setApiAuthToken,
  syncAuthProfile,
  type AuthMe,
} from '../lib/api'
import {
  canManageClan,
  resolveRole,
  type UserRole,
} from '../lib/roles'
import { supabase, supabaseConfigured } from '../lib/supabase'

export type { UserRole }

type AuthContextValue = {
  session: Session | null
  email: string | null
  role: UserRole
  canEdit: boolean
  /** Same as canEdit — admins and clan master (super admin). */
  canManageRoster: boolean
  isSuperAdmin: boolean
  loading: boolean
  authConfigured: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshRole: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole>('viewer')
  const [loading, setLoading] = useState(true)

  const applySession = useCallback(async (next: Session | null) => {
    setSession(next)
    const token = next?.access_token ?? null
    setApiAuthToken(token)
    if (!token) {
      setRole('viewer')
      return
    }
    const email = next.user.email ?? null
    try {
      const me = await syncAuthProfile()
      setRole(resolveRole(me.role, email))
    } catch {
      try {
        const me = await fetchAuthMe()
        if (me.authenticated && me.role) {
          setRole(resolveRole(me.role, email))
        } else {
          setRole(resolveRole('viewer', email))
        }
      } catch {
        setRole(resolveRole('viewer', email))
      }
    }
  }, [])

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      void applySession(data.session).finally(() => setLoading(false))
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'TOKEN_REFRESHED') {
        setSession(next)
        setApiAuthToken(next?.access_token ?? null)
        return
      }
      void applySession(next)
    })

    return () => sub.subscription.unsubscribe()
  }, [applySession])

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setApiAuthToken(null)
    setSession(null)
    setRole('viewer')
  }, [])

  const refreshRole = useCallback(async () => {
    if (!session?.access_token) return
    setApiAuthToken(session.access_token)
    const me = await syncAuthProfile()
    setRole(resolveRole(me.role, session.user.email))
  }, [session?.access_token])

  const value = useMemo(
    (): AuthContextValue => ({
      session,
      email: session?.user.email ?? null,
      role,
      canEdit: canManageClan(role),
      canManageRoster: canManageClan(role),
      isSuperAdmin: role === 'super_admin',
      loading,
      authConfigured: supabaseConfigured,
      signInWithGoogle,
      signOut,
      refreshRole,
    }),
    [session, role, loading, signInWithGoogle, signOut, refreshRole],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
