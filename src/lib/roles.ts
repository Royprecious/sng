import type { AuthMe } from './api'

export type UserRole = AuthMe['role']

const DEFAULT_SUPER_ADMIN_EMAIL = 'roypouomogne@gmail.com'

export function superAdminEmail(): string {
  const fromEnv = import.meta.env.VITE_SUPER_ADMIN_EMAIL as string | undefined
  return (fromEnv?.trim() || DEFAULT_SUPER_ADMIN_EMAIL).toLowerCase()
}

/** Match server SUPER_ADMIN_EMAIL promotion logic. */
export function resolveRole(
  apiRole: UserRole,
  email: string | undefined | null,
): UserRole {
  if (email?.toLowerCase() === superAdminEmail()) {
    return 'super_admin'
  }
  return apiRole
}

export function canManageClan(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin'
}
