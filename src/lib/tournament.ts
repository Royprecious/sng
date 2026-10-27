export type ScoringConfig = {
  killPoint: number
  placementPoints: number[]
}

export type PlayerEntry = {
  id: string
  name: string
  kills: number
}

export type TeamEntry = {
  id: string
  name: string
  placement: number
  players: PlayerEntry[]
}

export type MatchEntry = {
  id: string
  label: string
  teams: TeamEntry[]
}

/** Display calculated points as whole numbers (rounded). */
export function formatPoints(value: number): string {
  if (!Number.isFinite(value)) return '0'
  return String(Math.round(value))
}

export function placementScore(
  placement: number,
  placementPoints: number[],
): number {
  if (placement < 1) return 0
  const index = placement - 1
  return placementPoints[index] ?? 0
}

export function playerMatchPoints(kills: number, killPoint: number): number {
  return kills * killPoint
}

export function teamKillPoints(
  team: TeamEntry,
  killPoint: number,
): number {
  return team.players.reduce(
    (sum, p) => sum + playerMatchPoints(p.kills, killPoint),
    0,
  )
}

export function teamPlacementPoints(
  team: TeamEntry,
  placementPoints: number[],
): number {
  return placementScore(team.placement, placementPoints)
}

export function teamMatchPoints(
  team: TeamEntry,
  config: ScoringConfig,
): number {
  return (
    teamKillPoints(team, config.killPoint) +
    teamPlacementPoints(team, config.placementPoints)
  )
}

/** Player score for one match = kills × kill point value only. */
export function playerMatchPointsTotal(
  player: PlayerEntry,
  _team: TeamEntry,
  config: ScoringConfig,
): number {
  if (!player.name.trim()) return 0
  return playerMatchPoints(player.kills, config.killPoint)
}

export type PlayerAggregate = {
  name: string
  totalKills: number
  totalPoints: number
  matchesPlayed: number
}

export type TeamAggregate = {
  name: string
  totalPoints: number
  totalKills: number
  matchesPlayed: number
}

export type TeamSeriesRow = {
  name: string
  totalPoints: number
  totalKills: number
  /** Points per match id (same team name rolled up across the series). */
  pointsByMatchId: Record<string, number>
  killsByMatchId: Record<string, number>
}

/** Per-team totals for every match — for series winner / matrix UI. */
export function buildTeamSeriesBreakdown(
  matches: MatchEntry[],
  config: ScoringConfig,
): TeamSeriesRow[] {
  const map = new Map<string, TeamSeriesRow>()

  for (const match of matches) {
    for (const team of match.teams) {
      const key = team.name.trim().toLowerCase()
      if (!key) continue
      const pts = teamMatchPoints(team, config)
      const kills = team.players.reduce((s, p) => s + p.kills, 0)
      let row = map.get(key)
      if (!row) {
        row = {
          name: team.name.trim(),
          totalPoints: 0,
          totalKills: 0,
          pointsByMatchId: {},
          killsByMatchId: {},
        }
        map.set(key, row)
      }
      row.pointsByMatchId[match.id] =
        (row.pointsByMatchId[match.id] ?? 0) + pts
      row.killsByMatchId[match.id] =
        (row.killsByMatchId[match.id] ?? 0) + kills
      row.totalPoints += pts
      row.totalKills += kills
    }
  }

  return [...map.values()].sort((a, b) => b.totalPoints - a.totalPoints)
}

export function aggregatePlayers(
  matches: MatchEntry[],
  config: ScoringConfig,
): PlayerAggregate[] {
  const map = new Map<string, PlayerAggregate>()

  for (const match of matches) {
    for (const team of match.teams) {
      for (const player of team.players) {
        const key = player.name.trim().toLowerCase()
        if (!key) continue
        const pts = playerMatchPointsTotal(player, team, config)
        const existing = map.get(key)
        if (existing) {
          existing.totalKills += player.kills
          existing.totalPoints += pts
          existing.matchesPlayed += 1
        } else {
          map.set(key, {
            name: player.name.trim(),
            totalKills: player.kills,
            totalPoints: pts,
            matchesPlayed: 1,
          })
        }
      }
    }
  }

  return [...map.values()].sort((a, b) => b.totalPoints - a.totalPoints)
}

export function aggregateTeams(
  matches: MatchEntry[],
  config: ScoringConfig,
): TeamAggregate[] {
  const map = new Map<string, TeamAggregate>()

  for (const match of matches) {
    for (const team of match.teams) {
      const key = team.name.trim().toLowerCase()
      if (!key) continue
      const pts = teamMatchPoints(team, config)
      const kills = team.players.reduce((s, p) => s + p.kills, 0)
      const existing = map.get(key)
      if (existing) {
        existing.totalPoints += pts
        existing.totalKills += kills
        existing.matchesPlayed += 1
      } else {
        map.set(key, {
          name: team.name.trim(),
          totalPoints: pts,
          totalKills: kills,
          matchesPlayed: 1,
        })
      }
    }
  }

  return [...map.values()].sort((a, b) => b.totalPoints - a.totalPoints)
}

export function createId(): string {
  return crypto.randomUUID()
}

export const DEFAULT_PLACEMENT_POINTS = Array.from({ length: 15 }, () => 0)
