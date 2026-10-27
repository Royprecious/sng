export type SeedSoldierRow = {
  legacy_id: string
  gamertag: string
  role: string
  clan_rank: string
  tier: string
  specialty: string
  kd: string
  combat_role?: string
  region: string
  avatar: string
  sort_order: number
}

/** Empty by default — add rows here only if you want `npm run seed` to populate Supabase. */
export const seedSoldiers: SeedSoldierRow[] = []
