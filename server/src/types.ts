export type SoldierRow = {
  id: string
  legacy_id: string | null
  gamertag: string
  role: string
  clan_rank: string
  tier: string
  specialty: string
  kd: string
  region: string
  avatar: string
  combat_role: string | null
  sort_order: number
}

export type TournamentStateRow = {
  id: string
  name: string
  is_current: boolean
  event_date: string | null
  prize_pool: string | null
  kill_point: number
  placement_points: number[]
  matches: unknown
  updated_at: string
}
