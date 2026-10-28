import type { NextFunction, Request, Response } from 'express'
import { supabase } from './supabase.js'

export type UserRole = 'super_admin' | 'admin' | 'viewer'

const SUPER_ADMIN_EMAIL = (
  process.env.SUPER_ADMIN_EMAIL ?? 'roypouomogne@gmail.com'
).toLowerCase()

declare global {
  namespace Express {
    interface Request {
      authUser?: { id: string; email: string }
      role?: UserRole
    }
  }
}

export type AuthedRequest = Request

export async function attachAuth(
  req: AuthedRequest,
  _res: Response,
  next: NextFunction,
) {
  req.role = 'viewer'
  delete req.authUser

  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    next()
    return
  }

  try {
    const token = header.slice(7)
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user?.email) {
      next()
      return
    }

    const email = data.user.email.toLowerCase()
    const userId = data.user.id
    req.authUser = { id: userId, email }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    let role = (profile?.role as UserRole | undefined) ?? 'viewer'

    if (email === SUPER_ADMIN_EMAIL) {
      role = 'super_admin'
      await supabase.from('profiles').upsert(
        {
          id: userId,
          email,
          role: 'super_admin',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
    } else if (!profile) {
      await supabase.from('profiles').upsert(
        {
          id: userId,
          email,
          role: 'viewer',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
    } else {
      role = profile.role as UserRole
    }

    req.role = role

    void supabase
      .from('profiles')
      .update({
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
  } catch (err) {
    console.error('attachAuth failed (check Supabase server env):', err)
  }

  next()
}

export function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.authUser) {
    res.status(401).json({ error: 'Sign in required' })
    return
  }
  next()
}

export function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.role === 'admin' || req.role === 'super_admin') {
    next()
    return
  }
  res.status(403).json({ error: 'Admin access required' })
}

export function requireSuperAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  if (req.role === 'super_admin') {
    next()
    return
  }
  res.status(403).json({ error: 'Super admin access required' })
}

export function isAdminRole(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin'
}
