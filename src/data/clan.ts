/** In-game clan tag (COD Mobile). */
export const CLAN_TAG = 'Sngঔ'

/** Full clan name shown on the site. */
export const CLAN_NAME = 'SniperGang'

export const combatRoles = ['fragger', 'support', 'sniper', 'igl'] as const
export type CombatRole = (typeof combatRoles)[number]

export function formatCombatRole(role: CombatRole | string): string {
  const r = role.toLowerCase()
  if (r === 'igl') return 'IGL'
  if (r === 'fragger') return 'Fragger'
  if (r === 'support') return 'Support'
  if (r === 'sniper') return 'Sniper'
  return role
}

export type ClanRank =
  | 'clan_master'
  | 'clan_mistress'
  | 'vice_clan_master'
  | 'clan_coordinator'
  | 'member'

export type Soldier = {
  id: string
  gamertag: string
  role: 'Leader' | 'Co-Leader' | 'Captain' | 'Elite' | 'Soldier'
  clanRank: ClanRank
  tier: TierId
  specialty: string
  kd: string
  combatRole: CombatRole
  region: string
  avatar: string
  /** Used to place coordinators in pyramid slots 1–3. */
  sortOrder: number
}

/** DB sort_order values for the three coordinator cards (left → right). */
export const COORDINATOR_SLOT_BASE = 100

export function sortOrderForCoordinatorSlot(index: number): number {
  return COORDINATOR_SLOT_BASE + index
}

export type LeadershipSlotTarget =
  | { rank: 'clan_master' | 'clan_mistress' | 'vice_clan_master' }
  | { rank: 'clan_coordinator'; coordinatorIndex: 0 | 1 | 2 }

export type LeadershipSlot = {
  rank: ClanRank
  title: string
  subtitle: string
  maxCount: number
}

export const leadershipSlots: LeadershipSlot[] = [
  {
    rank: 'clan_master',
    title: 'Clan Master',
    subtitle: 'Supreme command & final decisions',
    maxCount: 1,
  },
  {
    rank: 'clan_mistress',
    title: 'Clan Mistress',
    subtitle: 'Co-command & clan culture',
    maxCount: 1,
  },
  {
    rank: 'vice_clan_master',
    title: 'Vice Clan Master',
    subtitle: 'Second-in-command operations',
    maxCount: 1,
  },
  {
    rank: 'clan_coordinator',
    title: 'Clan Coordinator',
    subtitle: 'Squad leaders & event coordination',
    maxCount: 3,
  },
]

const clanRankSort: Record<ClanRank, number> = {
  clan_master: 0,
  clan_mistress: 1,
  vice_clan_master: 2,
  clan_coordinator: 3,
  member: 4,
}

export function getClanRankLabel(rank: ClanRank): string {
  if (rank === 'member') return 'Member'
  return leadershipSlots.find((s) => s.rank === rank)?.title ?? 'Member'
}

export function sortSoldiersByHierarchy(a: Soldier, b: Soldier): number {
  const rankDiff = clanRankSort[a.clanRank] - clanRankSort[b.clanRank]
  if (rankDiff !== 0) return rankDiff
  const tierDiff =
    tiers.find((t) => t.id === a.tier)!.rank -
    tiers.find((t) => t.id === b.tier)!.rank
  if (tierDiff !== 0) return tierDiff
  return a.gamertag.localeCompare(b.gamertag)
}

export function getSoldiersByClanRank(
  rank: ClanRank,
  list: Soldier[],
): Soldier[] {
  return list.filter((s) => s.clanRank === rank)
}

export function getLeadershipSlotHolders(soldiers: Soldier[]): {
  master: Soldier | undefined
  mistress: Soldier | undefined
  vice: Soldier | undefined
  coordinators: [
    Soldier | undefined,
    Soldier | undefined,
    Soldier | undefined,
  ]
} {
  const master = soldiers.find((s) => s.clanRank === 'clan_master')
  const mistress = soldiers.find((s) => s.clanRank === 'clan_mistress')
  const vice = soldiers.find((s) => s.clanRank === 'vice_clan_master')

  const coordinators = soldiers.filter(
    (s) => s.clanRank === 'clan_coordinator',
  )
  const bySort = [...coordinators].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  )
  const slots: [
    Soldier | undefined,
    Soldier | undefined,
    Soldier | undefined,
  ] = [undefined, undefined, undefined]

  for (const s of coordinators) {
    const idx = s.sortOrder - COORDINATOR_SLOT_BASE
    if (idx >= 0 && idx <= 2) {
      slots[idx] = s
    }
  }
  for (let i = 0; i < 3; i++) {
    if (!slots[i]) {
      const next = bySort.find(
        (c) => !slots.some((s) => s?.id === c.id),
      )
      if (next) slots[i] = next
    }
  }

  return { master, mistress, vice, coordinators: slots }
}

export function leadershipSlotTitle(target: LeadershipSlotTarget): string {
  if (target.rank === 'clan_coordinator') {
    return `${leadershipSlots[3].title} ${target.coordinatorIndex + 1}`
  }
  return leadershipSlots.find((s) => s.rank === target.rank)?.title ?? 'Leader'
}

export type TierId = 't1' | 't2' | 't3' | 't4' | 't5'

export type TierDefinition = {
  id: TierId
  /** Shorthand shown on cards, e.g. T1 */
  code: string
  /** Full name, e.g. Tier 1 */
  label: string
  rank: number
  description: string
  minPoints: number
  color: string
  glow: string
  /** Tier board page: gradient border wrapper (p-px). */
  boardFrame: string
  /** Tier board header band gradient. */
  boardHeader: string
  /** Tier board member list background tint. */
  boardBody: string
  /** Accent text / badges on tier board. */
  boardAccent: string
  /** Row hover ring / border on tier board. */
  boardHover: string
}

/** T1 (highest) through T5 — every soldier must have exactly one `tier`. */
export const tiers: TierDefinition[] = [
  {
    id: 't1',
    code: 'T1',
    label: 'Tier 1',
    rank: 1,
    description: 'Elite core — tournament anchors and top fraggers.',
    minPoints: 5000,
    color: 'from-rose-400 to-cm-red',
    glow: 'shadow-cm-red/40',
    boardFrame: 'tier-board-frame-t1',
    boardHeader: 'tier-board-header-t1',
    boardBody: 'tier-board-body-t1',
    boardAccent: 'text-rose-300',
    boardHover:
      'hover:border-cm-red/50 hover:shadow-[0_0_24px_rgba(206,17,38,0.2)]',
  },
  {
    id: 't2',
    code: 'T2',
    label: 'Tier 2',
    rank: 2,
    description: 'Veterans who consistently impact scrims and ranked.',
    minPoints: 3500,
    color: 'from-purple-400 to-violet-800',
    glow: 'shadow-purple-500/45',
    boardFrame: 'tier-board-frame-t2',
    boardHeader: 'tier-board-header-t2',
    boardBody: 'tier-board-body-t2',
    boardAccent: 'text-purple-300',
    boardHover:
      'hover:border-purple-500/50 hover:shadow-[0_0_24px_rgba(168,85,247,0.22)]',
  },
  {
    id: 't3',
    code: 'T3',
    label: 'Tier 3',
    rank: 3,
    description: 'Solid squad players with strong map IQ and comms.',
    minPoints: 2000,
    color: 'from-sky-400 to-blue-800',
    glow: 'shadow-sky-500/35',
    boardFrame: 'tier-board-frame-t3',
    boardHeader: 'tier-board-header-t3',
    boardBody: 'tier-board-body-t3',
    boardAccent: 'text-sky-300',
    boardHover: 'hover:border-sky-500/45 hover:shadow-[0_0_24px_rgba(56,189,248,0.18)]',
  },
  {
    id: 't4',
    code: 'T4',
    label: 'Tier 4',
    rank: 4,
    description: 'Developing talent proving themselves in clan events.',
    minPoints: 1000,
    color: 'from-emerald-400 to-cm-green',
    glow: 'shadow-emerald-500/30',
    boardFrame: 'tier-board-frame-t4',
    boardHeader: 'tier-board-header-t4',
    boardBody: 'tier-board-body-t4',
    boardAccent: 'text-emerald-300',
    boardHover: 'hover:border-cm-green/45 hover:shadow-[0_0_24px_rgba(0,122,94,0.18)]',
  },
  {
    id: 't5',
    code: 'T5',
    label: 'Tier 5',
    rank: 5,
    description: 'New recruits and grinders climbing the board.',
    minPoints: 0,
    color: 'from-amber-400 to-orange-600',
    glow: 'shadow-amber-500/35',
    boardFrame: 'tier-board-frame-t5',
    boardHeader: 'tier-board-header-t5',
    boardBody: 'tier-board-body-t5',
    boardAccent: 'text-orange-300',
    boardHover: 'hover:border-orange-500/45 hover:shadow-[0_0_24px_rgba(249,115,22,0.18)]',
  },
]

export function formatTier(tier: TierDefinition): string {
  return `${tier.code} (${tier.label})`
}

/** Shown in add-soldier and admin tables — e.g. Tier 1 … Tier 5. */
export function formatTierLabel(id: TierId): string {
  return getTier(id).label
}

/** Offline fallback only — roster comes from Supabase via the API. */
export const soldiers: Soldier[] = []

export function getTier(id: TierId): TierDefinition {
  return tiers.find((t) => t.id === id) ?? tiers[tiers.length - 1]
}
