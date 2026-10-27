import type { MatchEntry, ScoringConfig } from './tournament'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

let authToken: string | null = null

export function setApiAuthToken(token: string | null) {
  authToken = token
}

export type AuthMe = {
  authenticated: boolean
  email?: string
  role: 'super_admin' | 'admin' | 'viewer'
  canEdit?: boolean
}

export type InviteCode = {
  id: string
  code: string
  label: string | null
  max_uses: number
  use_count: number
  expires_at: string | null
  created_at: string
}

export type AuthUserRow = {
  id: string
  email: string
  role: 'super_admin' | 'admin' | 'viewer'
  lastSeenAt: string | null
  online: boolean
}

export type ApiSoldier = {
  id: string
  legacyId?: string | null
  gamertag: string
  role: string
  clanRank: string
  tier: string
  specialty: string
  kd: string
  combatRole: string
  region: string
  avatar: string
  sortOrder?: number
}

export type TournamentSummary = {
  id: string
  name: string
  isCurrent: boolean
  eventDate?: string | null
  prizePool?: string | null
  updatedAt?: string
}

export type TournamentPayload = ScoringConfig & {
  id?: string
  name?: string
  isCurrent?: boolean
  eventDate?: string | null
  prizePool?: string | null
  matches: MatchEntry[]
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(
      (body as { error?: string }).error ?? `Request failed (${res.status})`,
    )
  }
  if (res.status === 204) {
    return undefined as T
  }
  return res.json() as Promise<T>
}

export async function fetchSoldiers(): Promise<ApiSoldier[]> {
  return request<ApiSoldier[]>('/api/soldiers')
}

export async function fetchSignedInUsers(): Promise<AuthUserRow[]> {
  return request<AuthUserRow[]>('/api/auth/users')
}

export async function createSoldier(body: {
  name: string
  role?: string
  clanRank?: string
  tier?: string
  combatRole?: string
  region?: string
}): Promise<ApiSoldier> {
  return request<ApiSoldier>('/api/soldiers', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function updateSoldier(
  id: string,
  body: {
    name: string
    role?: string
    clanRank?: string
    tier?: string
    combatRole?: string
    region?: string
  },
): Promise<ApiSoldier> {
  return request<ApiSoldier>(`/api/soldiers/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function assignLeadershipSlot(body: {
  rank:
    | 'clan_master'
    | 'clan_mistress'
    | 'vice_clan_master'
    | 'clan_coordinator'
  coordinatorIndex?: number
  clear?: boolean
  soldierId?: string
  newSoldier?: {
    name: string
    role?: string
    tier?: string
    combatRole?: string
    region?: string
  }
}): Promise<ApiSoldier | { ok: true }> {
  return request<ApiSoldier | { ok: true }>('/api/leadership/slot', {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function deleteSoldier(id: string): Promise<void> {
  await request<void>(`/api/soldiers/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function fetchTournamentList(): Promise<TournamentSummary[]> {
  return request('/api/tournaments')
}

export async function fetchTournamentById(
  id: string,
): Promise<TournamentPayload & { updatedAt?: string }> {
  return request(`/api/tournaments/${encodeURIComponent(id)}`)
}

export async function createTournament(body: {
  name?: string
  eventDate?: string
  prizePool?: string
}): Promise<TournamentPayload & { updatedAt?: string }> {
  return request('/api/tournaments', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function setCurrentTournament(
  id: string,
): Promise<TournamentSummary> {
  return request(
    `/api/tournaments/${encodeURIComponent(id)}/set-current`,
    { method: 'POST' },
  )
}

export async function deleteTournament(id: string): Promise<void> {
  await request<void>(`/api/tournaments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export async function saveTournament(
  id: string,
  payload: TournamentPayload,
): Promise<TournamentPayload & { updatedAt?: string }> {
  return request(`/api/tournaments/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

/** Loads the clan-live tournament (is current). */
export async function fetchLiveTournament(): Promise<
  TournamentPayload & { updatedAt?: string }
> {
  return request('/api/tournament')
}

/** Live tournament, or newest saved event if none is marked live. */
export async function fetchLiveTournamentWithFallback(): Promise<
  TournamentPayload & { updatedAt?: string }
> {
  try {
    return await fetchLiveTournament()
  } catch (firstErr) {
    try {
      const list = await fetchTournamentList()
      const pick = list.find((t) => t.isCurrent) ?? list[0]
      if (pick) return fetchTournamentById(pick.id)
    } catch {
      /* fall through */
    }
    throw firstErr
  }
}

/** Only the tournament marked live (Set as live on Tournament page). */
export async function fetchActiveLiveTournament(): Promise<
  TournamentPayload & { updatedAt?: string }
> {
  const list = await fetchTournamentList()
  const live = list.filter((t) => t.isCurrent)
  if (live.length === 0) {
    throw new Error('NO_LIVE_TOURNAMENT')
  }
  return fetchTournamentById(live[0].id)
}

export async function fetchAuthMe(): Promise<AuthMe> {
  return request<AuthMe>('/api/auth/me')
}

export async function syncAuthProfile(): Promise<AuthMe> {
  return request<AuthMe>('/api/auth/sync-profile', { method: 'POST' })
}

export async function redeemAdminCode(
  code: string,
): Promise<{ role: string; message: string }> {
  return request('/api/admin/redeem', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export async function createInviteCode(body: {
  label?: string
  maxUses?: number
  expiresInDays?: number
}): Promise<InviteCode> {
  return request<InviteCode>('/api/admin/invite-codes', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function listInviteCodes(): Promise<InviteCode[]> {
  return request<InviteCode[]>('/api/admin/invite-codes')
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/health`)
    return res.ok
  } catch {
    return false
  }
}
