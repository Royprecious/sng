import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import {
  attachAuth,
  requireAdmin,
  requireSuperAdmin,
} from './auth.js'
import { applyClanTagToName, avatarFromGamertag } from './gamertag.js'
import { generateInviteCode } from './codes.js'
import { supabase } from './supabase.js'
import type { SoldierRow, TournamentStateRow } from './types.js'

const app = express()
const port = Number(process.env.PORT) || 3001
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://127.0.0.1:5173'

function corsOrigins(): string[] {
  const origins = new Set<string>([
    clientOrigin,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
  ])
  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`)
  }
  if (process.env.VERCEL_BRANCH_URL) {
    origins.add(`https://${process.env.VERCEL_BRANCH_URL}`)
  }
  if (process.env.URL) {
    origins.add(process.env.URL)
  }
  if (process.env.DEPLOY_PRIME_URL) {
    origins.add(process.env.DEPLOY_PRIME_URL)
  }
  if (process.env.DEPLOY_URL) {
    origins.add(process.env.DEPLOY_URL)
  }
  return [...origins]
}

function shouldListenLocally(): boolean {
  if (process.env.VERCEL) return false
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) return false
  if (process.env.NETLIFY) return false
  return true
}

app.use(
  cors({
    origin: corsOrigins(),
  }),
)
app.use(express.json({ limit: '2mb' }))

/** Netlify Functions may invoke without the /api prefix on the path. */
app.use((req, _res, next) => {
  if (!req.path.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? req.url : `/${req.url}`}`
  }
  next()
})

app.use(attachAuth)

const ONLINE_MS = 5 * 60 * 1000

const CLAN_RANKS = [
  'clan_master',
  'clan_mistress',
  'vice_clan_master',
  'clan_coordinator',
  'member',
] as const

const TIERS = ['t1', 't2', 't3', 't4', 't5'] as const

const ROLES = ['Leader', 'Co-Leader', 'Captain', 'Elite', 'Soldier'] as const

const COMBAT_ROLES = ['fragger', 'support', 'sniper', 'igl'] as const

const COORDINATOR_SLOT_BASE = 100

function coordinatorSortOrder(index: number): number {
  return COORDINATOR_SLOT_BASE + index
}

function mapSoldier(row: SoldierRow) {
  return {
    id: row.id,
    legacyId: row.legacy_id,
    gamertag: row.gamertag,
    role: row.role,
    clanRank: row.clan_rank,
    tier: row.tier,
    specialty: row.specialty,
    kd: row.kd,
    region: row.region,
    avatar: row.avatar,
    combatRole: row.combat_role ?? 'support',
    sortOrder: row.sort_order,
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'sng-api' })
})

app.get('/api/auth/me', (req, res) => {
  if (!req.authUser) {
    res.json({ authenticated: false, role: 'viewer' as const })
    return
  }
  res.json({
    authenticated: true,
    email: req.authUser.email,
    role: req.role,
    canEdit: req.role === 'admin' || req.role === 'super_admin',
  })
})

app.post('/api/auth/sync-profile', async (req, res) => {
  if (!req.authUser) {
    res.status(401).json({ error: 'Not signed in' })
    return
  }
  res.json({
    email: req.authUser.email,
    role: req.role,
    canEdit: req.role === 'admin' || req.role === 'super_admin',
  })
})

app.get('/api/auth/users', requireSuperAdmin, async (_req, res) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, last_seen_at, created_at, updated_at')
    .order('last_seen_at', { ascending: false, nullsFirst: false })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  const now = Date.now()
  res.json(
    (data ?? []).map((row) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      lastSeenAt: row.last_seen_at,
      online: row.last_seen_at
        ? now - new Date(row.last_seen_at).getTime() < ONLINE_MS
        : false,
    })),
  )
})

async function resolveSoldierUuid(param: string): Promise<string | null> {
  const { data: byUuid } = await supabase
    .from('soldiers')
    .select('id')
    .eq('id', param)
    .maybeSingle()
  if (byUuid?.id) return byUuid.id

  const { data: byLegacy } = await supabase
    .from('soldiers')
    .select('id')
    .eq('legacy_id', param)
    .maybeSingle()
  if (byLegacy?.id) return byLegacy.id

  const { data: byTag } = await supabase
    .from('soldiers')
    .select('id')
    .eq('gamertag', param)
    .maybeSingle()
  return byTag?.id ?? null
}

app.post('/api/soldiers', requireAdmin, async (req, res) => {
  const body = req.body ?? {}
  const rawName = String(body.name ?? body.gamertag ?? '').trim()
  if (!rawName) {
    res.status(400).json({ error: 'Name is required' })
    return
  }

  let gamertag: string
  try {
    gamertag = applyClanTagToName(rawName)
  } catch {
    res.status(400).json({ error: 'Invalid name' })
    return
  }

  const clanRank = String(body.clanRank ?? body.clan_rank ?? 'member')
  const tier = String(body.tier ?? 't5')
  const role = String(body.role ?? 'Soldier')

  if (!CLAN_RANKS.includes(clanRank as (typeof CLAN_RANKS)[number])) {
    res.status(400).json({ error: 'Invalid clan rank' })
    return
  }
  if (!TIERS.includes(tier as (typeof TIERS)[number])) {
    res.status(400).json({ error: 'Invalid tier' })
    return
  }
  if (!ROLES.includes(role as (typeof ROLES)[number])) {
    res.status(400).json({ error: 'Invalid role' })
    return
  }

  const { data: maxRow } = await supabase
    .from('soldiers')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder = (maxRow?.sort_order ?? 0) + 1
  const combatRole = String(
    body.combatRole ?? body.combat_role ?? 'support',
  ).toLowerCase()
  const region = String(body.region ?? 'CM')
  const avatar =
    String(body.avatar ?? '').trim() || avatarFromGamertag(gamertag)

  if (!COMBAT_ROLES.includes(combatRole as (typeof COMBAT_ROLES)[number])) {
    res.status(400).json({ error: 'Invalid combat role' })
    return
  }

  const { data, error } = await supabase
    .from('soldiers')
    .insert({
      gamertag,
      role,
      clan_rank: clanRank,
      tier,
      specialty: '',
      kd: '—',
      combat_role: combatRole,
      region,
      avatar,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    const msg =
      error.code === '23505'
        ? 'A soldier with that gamertag already exists'
        : error.message
    res.status(error.code === '23505' ? 409 : 500).json({ error: msg })
    return
  }

  res.status(201).json(mapSoldier(data as SoldierRow))
})

app.put('/api/soldiers/:id', requireAdmin, async (req, res) => {
  const soldierId = await resolveSoldierUuid(req.params.id)
  if (!soldierId) {
    res.status(404).json({ error: 'Soldier not found' })
    return
  }

  const body = req.body ?? {}
  const rawName = String(body.name ?? body.gamertag ?? '').trim()
  if (!rawName) {
    res.status(400).json({ error: 'Name is required' })
    return
  }

  let gamertag: string
  try {
    gamertag = applyClanTagToName(rawName)
  } catch {
    res.status(400).json({ error: 'Invalid name' })
    return
  }

  const clanRank = String(body.clanRank ?? body.clan_rank ?? 'member')
  const tier = String(body.tier ?? 't5')
  const role = String(body.role ?? 'Soldier')
  const combatRole = String(
    body.combatRole ?? body.combat_role ?? 'support',
  ).toLowerCase()
  const region = String(body.region ?? 'CM')
  const avatar =
    String(body.avatar ?? '').trim() || avatarFromGamertag(gamertag)

  if (!CLAN_RANKS.includes(clanRank as (typeof CLAN_RANKS)[number])) {
    res.status(400).json({ error: 'Invalid clan rank' })
    return
  }
  if (!TIERS.includes(tier as (typeof TIERS)[number])) {
    res.status(400).json({ error: 'Invalid tier' })
    return
  }
  if (!ROLES.includes(role as (typeof ROLES)[number])) {
    res.status(400).json({ error: 'Invalid role' })
    return
  }
  if (!COMBAT_ROLES.includes(combatRole as (typeof COMBAT_ROLES)[number])) {
    res.status(400).json({ error: 'Invalid combat role' })
    return
  }

  const { data, error } = await supabase
    .from('soldiers')
    .update({
      gamertag,
      role,
      clan_rank: clanRank,
      tier,
      specialty: '',
      kd: '—',
      combat_role: combatRole,
      region,
      avatar,
      updated_at: new Date().toISOString(),
    })
    .eq('id', soldierId)
    .select()
    .single()

  if (error) {
    const msg =
      error.code === '23505'
        ? 'A soldier with that gamertag already exists'
        : error.message
    res.status(error.code === '23505' ? 409 : 500).json({ error: msg })
    return
  }

  res.json(mapSoldier(data as SoldierRow))
})

app.delete('/api/soldiers/:id', requireAdmin, async (req, res) => {
  const soldierId = await resolveSoldierUuid(req.params.id)
  if (!soldierId) {
    res.status(404).json({ error: 'Soldier not found' })
    return
  }

  const { error } = await supabase
    .from('soldiers')
    .delete()
    .eq('id', soldierId)

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.status(204).send()
})

const LEADERSHIP_RANKS = [
  'clan_master',
  'clan_mistress',
  'vice_clan_master',
  'clan_coordinator',
] as const

async function demoteToMember(soldierId: string) {
  await supabase
    .from('soldiers')
    .update({
      clan_rank: 'member',
      updated_at: new Date().toISOString(),
    })
    .eq('id', soldierId)
}

app.put('/api/leadership/slot', requireSuperAdmin, async (req, res) => {
  const body = req.body ?? {}
  const rank = String(body.rank ?? '')
  if (!LEADERSHIP_RANKS.includes(rank as (typeof LEADERSHIP_RANKS)[number])) {
    res.status(400).json({ error: 'Invalid leadership rank' })
    return
  }

  let coordinatorIndex: number | null = null
  if (rank === 'clan_coordinator') {
    const idx = Number(body.coordinatorIndex)
    if (!Number.isInteger(idx) || idx < 0 || idx > 2) {
      res.status(400).json({ error: 'coordinatorIndex must be 0, 1, or 2' })
      return
    }
    coordinatorIndex = idx
  }

  const clear = Boolean(body.clear)
  const soldierId = body.soldierId ? String(body.soldierId) : null
  const newSoldier = body.newSoldier

  if (clear && (soldierId || newSoldier)) {
    res.status(400).json({ error: 'Use clear alone or assign, not both' })
    return
  }
  if (!clear && !soldierId && !newSoldier) {
    res.status(400).json({ error: 'Provide soldierId, newSoldier, or clear' })
    return
  }
  if (soldierId && newSoldier) {
    res.status(400).json({ error: 'Provide soldierId or newSoldier, not both' })
    return
  }

  const slotSortOrder =
    rank === 'clan_coordinator' && coordinatorIndex !== null
      ? coordinatorSortOrder(coordinatorIndex)
      : null

  async function findSlotHolderId(): Promise<string | null> {
    if (rank === 'clan_coordinator' && slotSortOrder !== null) {
      const { data: byOrder } = await supabase
        .from('soldiers')
        .select('id')
        .eq('clan_rank', 'clan_coordinator')
        .eq('sort_order', slotSortOrder)
        .maybeSingle()
      if (byOrder?.id) return byOrder.id

      const { data: all } = await supabase
        .from('soldiers')
        .select('id, sort_order')
        .eq('clan_rank', 'clan_coordinator')
        .order('sort_order', { ascending: true })
      const list = all ?? []
      if (coordinatorIndex !== null && list[coordinatorIndex]?.id) {
        return list[coordinatorIndex].id
      }
      return null
    }

    const { data } = await supabase
      .from('soldiers')
      .select('id')
      .eq('clan_rank', rank)
      .limit(1)
      .maybeSingle()
    return data?.id ?? null
  }

  if (clear) {
    const holderId = await findSlotHolderId()
    if (holderId) await demoteToMember(holderId)
    res.json({ ok: true })
    return
  }

  let targetId = soldierId

  if (newSoldier) {
    const rawName = String(newSoldier.name ?? '').trim()
    if (!rawName) {
      res.status(400).json({ error: 'Name is required' })
      return
    }
    let gamertag: string
    try {
      gamertag = applyClanTagToName(rawName)
    } catch {
      res.status(400).json({ error: 'Invalid name' })
      return
    }

    const tier = String(newSoldier.tier ?? 't3')
    const role = String(newSoldier.role ?? 'Leader')
    const combatRole = String(
      newSoldier.combatRole ?? newSoldier.combat_role ?? 'support',
    ).toLowerCase()
    const region = String(newSoldier.region ?? 'CM')

    if (!TIERS.includes(tier as (typeof TIERS)[number])) {
      res.status(400).json({ error: 'Invalid tier' })
      return
    }
    if (!ROLES.includes(role as (typeof ROLES)[number])) {
      res.status(400).json({ error: 'Invalid role' })
      return
    }
    if (!COMBAT_ROLES.includes(combatRole as (typeof COMBAT_ROLES)[number])) {
      res.status(400).json({ error: 'Invalid combat role' })
      return
    }

    const { data: maxRow } = await supabase
      .from('soldiers')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const sortOrder =
      slotSortOrder ?? (maxRow?.sort_order ?? 0) + 1

    const { data: created, error: createErr } = await supabase
      .from('soldiers')
      .insert({
        gamertag,
        role,
        clan_rank: rank,
        tier,
        specialty: '',
        kd: '—',
        combat_role: combatRole,
        region,
        avatar: avatarFromGamertag(gamertag),
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createErr) {
      const msg =
        createErr.code === '23505'
          ? 'A soldier with that gamertag already exists'
          : createErr.message
      res.status(createErr.code === '23505' ? 409 : 500).json({ error: msg })
      return
    }
    targetId = created.id
  }

  if (!targetId) {
    res.status(400).json({ error: 'Could not resolve soldier' })
    return
  }

  const resolvedId = await resolveSoldierUuid(targetId)
  if (!resolvedId) {
    res.status(404).json({ error: 'Soldier not found' })
    return
  }

  const currentHolderId = await findSlotHolderId()
  if (currentHolderId && currentHolderId !== resolvedId) {
    await demoteToMember(currentHolderId)
  }

  if (rank !== 'clan_coordinator') {
    const { data: others } = await supabase
      .from('soldiers')
      .select('id')
      .eq('clan_rank', rank)
      .neq('id', resolvedId)
    for (const row of others ?? []) {
      await demoteToMember(row.id)
    }
  }

  const { data: prior } = await supabase
    .from('soldiers')
    .select('clan_rank, sort_order')
    .eq('id', resolvedId)
    .maybeSingle()

  if (
    prior?.clan_rank === 'clan_coordinator' &&
    rank !== 'clan_coordinator' &&
    prior.sort_order >= COORDINATOR_SLOT_BASE &&
    prior.sort_order <= COORDINATOR_SLOT_BASE + 2
  ) {
    /* vacated coordinator slot handled by reassignment */
  }

  const updatePayload: Record<string, unknown> = {
    clan_rank: rank,
    updated_at: new Date().toISOString(),
  }
  if (slotSortOrder !== null) {
    updatePayload.sort_order = slotSortOrder
  } else if (prior?.clan_rank === 'clan_coordinator') {
    const { data: maxRow } = await supabase
      .from('soldiers')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()
    updatePayload.sort_order = (maxRow?.sort_order ?? 0) + 1
  }

  const { data: updated, error: updateErr } = await supabase
    .from('soldiers')
    .update(updatePayload)
    .eq('id', resolvedId)
    .select()
    .single()

  if (updateErr) {
    res.status(500).json({ error: updateErr.message })
    return
  }

  res.json(mapSoldier(updated as SoldierRow))
})

app.post(
  '/api/admin/invite-codes',
  requireSuperAdmin,
  async (req, res) => {
    const { label, maxUses = 1, expiresInDays = 30 } = req.body ?? {}
    const code = generateInviteCode()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + Number(expiresInDays) || 30)

    const { data, error } = await supabase
      .from('admin_invite_codes')
      .insert({
        code,
        label: label ?? null,
        created_by: req.authUser!.id,
        max_uses: Math.max(1, Math.trunc(Number(maxUses) || 1)),
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }
    res.status(201).json(data)
  },
)

app.get(
  '/api/admin/invite-codes',
  requireSuperAdmin,
  async (_req, res) => {
    const { data, error } = await supabase
      .from('admin_invite_codes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      res.status(500).json({ error: error.message })
      return
    }
    res.json(data)
  },
)

app.post('/api/admin/redeem', async (req, res) => {
  if (!req.authUser) {
    res.status(401).json({ error: 'Sign in with Google first' })
    return
  }
  if (req.role === 'admin' || req.role === 'super_admin') {
    res.json({ role: req.role, message: 'Already an admin' })
    return
  }

  const rawCode = String(req.body?.code ?? '')
    .trim()
    .toUpperCase()
  if (!rawCode) {
    res.status(400).json({ error: 'Code is required' })
    return
  }

  const { data: invite, error: findErr } = await supabase
    .from('admin_invite_codes')
    .select('*')
    .eq('code', rawCode)
    .maybeSingle()

  if (findErr || !invite) {
    res.status(404).json({ error: 'Invalid code' })
    return
  }

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    res.status(410).json({ error: 'This code has expired' })
    return
  }
  if (invite.use_count >= invite.max_uses) {
    res.status(410).json({ error: 'This code has already been used' })
    return
  }

  const { error: redeemErr } = await supabase
    .from('admin_code_redemptions')
    .insert({ code_id: invite.id, user_id: req.authUser.id })

  if (redeemErr) {
    res.status(400).json({ error: 'Could not redeem code' })
    return
  }

  await supabase
    .from('admin_invite_codes')
    .update({ use_count: invite.use_count + 1 })
    .eq('id', invite.id)

  await supabase.from('profiles').upsert(
    {
      id: req.authUser.id,
      email: req.authUser.email,
      role: 'admin',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )

  res.json({ role: 'admin', message: 'You are now a clan admin' })
})

app.get('/api/soldiers', async (_req, res) => {
  const { data, error } = await supabase
    .from('soldiers')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  res.json((data as SoldierRow[]).map(mapSoldier))
})

function parseEventDate(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null
  const d = raw.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null
  return d
}

function parsePrizePool(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const t = raw.trim()
  return t || null
}

function isSchemaColumnError(message: string): boolean {
  return (
    /schema cache/i.test(message) ||
    /could not find the '.+' column/i.test(message)
  )
}

function stripUndefined(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(row).filter(([, v]) => v !== undefined),
  )
}

type TournamentInsertExtras = {
  name: string
  isCurrent: boolean
  eventDate: string | null
  prizePool: string | null
}

async function insertTournamentRow(
  row: Record<string, unknown>,
): Promise<{ data: unknown; error: { message: string } | null }> {
  const dropSets = [
    [],
    ['event_date', 'prize_pool'],
    ['event_date', 'prize_pool', 'name', 'is_current'],
  ] as const

  let lastError: { message: string } | null = null
  const base = { ...row }

  for (const drop of dropSets) {
    const attempt = stripUndefined({ ...base })
    for (const key of drop) {
      delete attempt[key]
    }
    const { data, error } = await supabase
      .from('tournament_state')
      .insert(attempt)
      .select()
      .single()
    if (!error) return { data, error: null }
    lastError = error
    if (!isSchemaColumnError(error.message)) break
  }

  return { data: null, error: lastError }
}

function mapTournamentRowWithFallback(
  row: TournamentStateRow,
  extras?: Partial<TournamentInsertExtras>,
) {
  return {
    ...mapTournamentRow(row),
    name: row.name ?? extras?.name ?? 'Tournament',
    isCurrent: row.is_current ?? extras?.isCurrent ?? false,
    eventDate: row.event_date ?? extras?.eventDate ?? null,
    prizePool: row.prize_pool ?? extras?.prizePool ?? null,
  }
}

function mapTournamentRow(row: TournamentStateRow) {
  return {
    id: row.id,
    name: row.name ?? 'Tournament',
    isCurrent: Boolean(row.is_current),
    eventDate: row.event_date ?? null,
    prizePool: row.prize_pool ?? null,
    killPoint: row.kill_point,
    placementPoints: row.placement_points,
    matches: row.matches,
    updatedAt: row.updated_at,
  }
}

function mapTournamentSummary(row: TournamentStateRow) {
  return {
    id: row.id,
    name: row.name ?? 'Tournament',
    isCurrent: Boolean(row.is_current),
    eventDate: row.event_date ?? null,
    prizePool: row.prize_pool ?? null,
    updatedAt: row.updated_at,
  }
}

const DEFAULT_PLACEMENT_JSON = Array(15).fill(0)

async function fetchTournamentRowById(id: string) {
  return supabase.from('tournament_state').select('*').eq('id', id).maybeSingle()
}

async function fetchCurrentTournamentRow() {
  const { data: current, error: curErr } = await supabase
    .from('tournament_state')
    .select('*')
    .eq('is_current', true)
    .maybeSingle()

  if (!curErr && current) {
    return { data: current as TournamentStateRow, error: null }
  }

  const { data: latest, error: latestErr } = await supabase
    .from('tournament_state')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!latestErr && latest) {
    return { data: latest as TournamentStateRow, error: null }
  }

  const legacy = await fetchTournamentRowById('default')
  if (!legacy.error && legacy.data) {
    return { data: legacy.data as TournamentStateRow, error: null }
  }

  return {
    data: null,
    error: legacy.error ?? latestErr ?? curErr ?? null,
  }
}

app.get('/api/tournaments', async (_req, res) => {
  const { data, error } = await supabase
    .from('tournament_state')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.json((data as TournamentStateRow[]).map(mapTournamentSummary))
})

app.post('/api/tournaments', requireAdmin, async (req, res) => {
  const name =
    typeof req.body?.name === 'string' && req.body.name.trim()
      ? req.body.name.trim()
      : 'New tournament'
  const eventDate = parseEventDate(req.body?.eventDate)
  const prizePool = parsePrizePool(req.body?.prizePool)
  const id = crypto.randomUUID()

  const { count, error: countErr } = await supabase
    .from('tournament_state')
    .select('*', { count: 'exact', head: true })

  if (countErr) {
    res.status(500).json({ error: countErr.message })
    return
  }

  const isFirstTournament = (count ?? 0) === 0

  const { data, error } = await insertTournamentRow({
    id,
    name,
    is_current: isFirstTournament,
    event_date: eventDate,
    prize_pool: prizePool,
    kill_point: 1,
    placement_points: DEFAULT_PLACEMENT_JSON,
    matches: [],
    updated_at: new Date().toISOString(),
  })

  if (error) {
    res.status(500).json({
      error: isSchemaColumnError(error.message)
        ? `${error.message} Run supabase/migrations/007_tournament_schema_fix.sql in the Supabase SQL editor, then wait ~30s and retry.`
        : error.message,
    })
    return
  }

  res.status(201).json(
    mapTournamentRowWithFallback(data as TournamentStateRow, {
      name,
      isCurrent: isFirstTournament,
      eventDate,
      prizePool,
    }),
  )
})

app.post('/api/tournaments/:id/set-current', requireAdmin, async (req, res) => {
  const { id } = req.params
  const { data: existing, error: loadErr } = await fetchTournamentRowById(id)
  if (loadErr) {
    res.status(500).json({ error: loadErr.message })
    return
  }
  if (!existing) {
    res.status(404).json({ error: 'Tournament not found' })
    return
  }

  const { error: clearErr } = await supabase
    .from('tournament_state')
    .update({ is_current: false })
    .eq('is_current', true)

  if (clearErr) {
    res.status(500).json({ error: clearErr.message })
    return
  }

  const { data, error } = await supabase
    .from('tournament_state')
    .update({ is_current: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.json(mapTournamentSummary(data as TournamentStateRow))
})

app.get('/api/tournaments/:id', async (req, res) => {
  const { data, error } = await fetchTournamentRowById(req.params.id)
  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  if (!data) {
    res.status(404).json({ error: 'Tournament not found' })
    return
  }
  res.json(mapTournamentRow(data as TournamentStateRow))
})

app.put('/api/tournaments/:id', requireAdmin, async (req, res) => {
  const { id } = req.params
  const { killPoint, placementPoints, matches, name, eventDate, prizePool } =
    req.body ?? {}

  if (typeof killPoint !== 'number' || !Array.isArray(placementPoints)) {
    res.status(400).json({ error: 'Invalid tournament payload' })
    return
  }

  const patch: Record<string, unknown> = {
    kill_point: Math.trunc(killPoint),
    placement_points: placementPoints,
    matches: matches ?? [],
    updated_at: new Date().toISOString(),
  }
  if (typeof name === 'string' && name.trim()) {
    patch.name = name.trim()
  }
  if (eventDate !== undefined) {
    patch.event_date = parseEventDate(eventDate)
  }
  if (prizePool !== undefined) {
    patch.prize_pool = parsePrizePool(prizePool)
  }

  const { data, error } = await supabase
    .from('tournament_state')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }
  if (!data) {
    res.status(404).json({ error: 'Tournament not found' })
    return
  }

  res.json(mapTournamentRow(data as TournamentStateRow))
})

app.delete('/api/tournaments/:id', requireSuperAdmin, async (req, res) => {
  const { id } = req.params
  const { data: existing, error: loadErr } = await fetchTournamentRowById(id)
  if (loadErr) {
    res.status(500).json({ error: loadErr.message })
    return
  }
  if (!existing) {
    res.status(404).json({ error: 'Tournament not found' })
    return
  }

  const wasCurrent = Boolean((existing as TournamentStateRow).is_current)

  const { error: delErr } = await supabase
    .from('tournament_state')
    .delete()
    .eq('id', id)

  if (delErr) {
    res.status(500).json({ error: delErr.message })
    return
  }

  if (wasCurrent) {
    const { data: next, error: nextErr } = await supabase
      .from('tournament_state')
      .select('id')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (nextErr) {
      res.status(500).json({ error: nextErr.message })
      return
    }
    if (next) {
      await supabase
        .from('tournament_state')
        .update({ is_current: true })
        .eq('id', next.id)
    }
  }

  res.status(204).send()
})

/** @deprecated use GET /api/tournaments/:id or load current via list */
app.get('/api/tournament', async (_req, res) => {
  const { data, error } = await fetchCurrentTournamentRow()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  if (!data) {
    res.json({
      id: 'default',
      name: 'Tournament',
      isCurrent: true,
      killPoint: 1,
      placementPoints: DEFAULT_PLACEMENT_JSON,
      matches: [],
    })
    return
  }

  res.json(mapTournamentRow(data as TournamentStateRow))
})

/** @deprecated use PUT /api/tournaments/:id */
app.put('/api/tournament', requireAdmin, async (req, res) => {
  const { killPoint, placementPoints, matches, name } = req.body ?? {}

  if (typeof killPoint !== 'number' || !Array.isArray(placementPoints)) {
    res.status(400).json({ error: 'Invalid tournament payload' })
    return
  }

  const { data: current } = await fetchCurrentTournamentRow()
  const id = (current as TournamentStateRow | null)?.id ?? 'default'

  const cur = current as TournamentStateRow | null
  const row = {
    id,
    name:
      typeof name === 'string' && name.trim()
        ? name.trim()
        : (cur?.name ?? 'Tournament'),
    is_current: cur?.is_current ?? true,
    kill_point: Math.trunc(killPoint),
    placement_points: placementPoints,
    matches: matches ?? [],
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('tournament_state')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single()

  if (error) {
    res.status(500).json({ error: error.message })
    return
  }

  res.json(mapTournamentRow(data as TournamentStateRow))
})

export default app

if (shouldListenLocally()) {
  app.listen(port, () => {
    console.log(`SNG API listening on http://127.0.0.1:${port}`)
  })
}
