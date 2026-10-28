import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useClan } from '../context/ClanContext'
import { Link } from 'react-router-dom'
import {
  fetchLiveTournament,
  fetchTournamentById,
  fetchTournamentList,
  deleteTournament,
  saveTournament,
  setCurrentTournament,
  type TournamentPayload,
  type TournamentSummary,
} from '../lib/api'
import { CreateTournamentDialog } from '../components/CreateTournamentDialog'
import type { Soldier } from '../data/clan'
import { PageHeader } from '../components/PageHeader'
import { PageShell } from '../components/PageShell'
import {
  aggregatePlayers,
  aggregateTeams,
  buildTeamSeriesBreakdown,
  createId,
  DEFAULT_PLACEMENT_POINTS,
  formatPoints,
  playerMatchPoints,
  playerMatchPointsTotal,
  teamKillPoints,
  teamMatchPoints,
  teamPlacementPoints,
  type MatchEntry,
  type PlayerEntry,
  type ScoringConfig,
  type TeamEntry,
} from '../lib/tournament'

const MAX_PLAYERS_PER_TEAM = 4

const scoringInputClass =
  'mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-bold text-blue-200 outline-none focus:border-blue-500'

function emptyPlayer(): PlayerEntry {
  return { id: createId(), name: '', kills: 0 }
}

function emptyTeam(): TeamEntry {
  return {
    id: createId(),
    name: '',
    placement: 1,
    players: [],
  }
}

function initialMatch(): MatchEntry {
  return {
    id: createId(),
    label: 'Match 1',
    teams: [emptyTeam()],
  }
}

/** Carry team names + rosters into the next match; kills reset, new ids. */
function cloneTeamsForNextMatch(teams: TeamEntry[]): TeamEntry[] {
  if (teams.length === 0) return [emptyTeam()]
  return teams.map((t) => ({
    id: createId(),
    name: t.name,
    placement: 1,
    players: t.players.length
      ? t.players.map((p) => ({
          id: createId(),
          name: p.name,
          kills: 0,
        }))
      : [],
  }))
}

function availableSoldiersForTeam(
  roster: Soldier[],
  team: TeamEntry,
  currentPlayerId?: string,
): Soldier[] {
  const used = new Set(
    team.players
      .filter((p) => p.id !== currentPlayerId && p.name.trim())
      .map((p) => p.name.trim().toLowerCase()),
  )
  return roster.filter((s) => !used.has(s.gamertag.toLowerCase()))
}

function canAddPlayerToTeam(roster: Soldier[], team: TeamEntry): boolean {
  if (team.players.length >= MAX_PLAYERS_PER_TEAM) return false
  if (team.players.some((p) => !p.name.trim())) return false
  return availableSoldiersForTeam(roster, team).length > 0
}

export function TournamentPage() {
  const { canEdit, isSuperAdmin } = useAuth()
  const { soldiers, apiConnected } = useClan()
  const readOnly = !canEdit
  const [config, setConfig] = useState<ScoringConfig>({
    killPoint: 1,
    placementPoints: [...DEFAULT_PLACEMENT_POINTS],
  })
  const [matches, setMatches] = useState<MatchEntry[]>(() => [initialMatch()])
  const [activeMatchId, setActiveMatchId] = useState('')
  const [tournamentId, setTournamentId] = useState('')
  const [isLive, setIsLive] = useState(true)
  const [tournamentList, setTournamentList] = useState<TournamentSummary[]>(
    [],
  )
  const [showCreateTournament, setShowCreateTournament] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [cloudLoaded, setCloudLoaded] = useState(false)
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')
  const skipSave = useRef(true)

  useEffect(() => {
    if (matches[0] && !activeMatchId) {
      setActiveMatchId(matches[0].id)
    }
  }, [matches, activeMatchId])

  function applyLoadedTournament(data: TournamentPayload) {
    if (data.id) setTournamentId(data.id)
    setIsLive(Boolean(data.isCurrent))
    setConfig({
      killPoint: data.killPoint,
      placementPoints: data.placementPoints?.length
        ? data.placementPoints
        : [...DEFAULT_PLACEMENT_POINTS],
    })
    const nextMatches =
      Array.isArray(data.matches) && data.matches.length > 0
        ? (data.matches as MatchEntry[])
        : [initialMatch()]
    setMatches(nextMatches)
    setActiveMatchId(nextMatches[0]?.id ?? '')
  }

  async function refreshTournamentList() {
    const list = await fetchTournamentList()
    setTournamentList(list)
    return list
  }

  async function switchTournament(id: string) {
    if (!id || id === tournamentId) return
    skipSave.current = true
    const data = await fetchTournamentById(id)
    applyLoadedTournament(data)
    skipSave.current = true
  }

  async function handleTournamentCreated(created: TournamentPayload) {
    await refreshTournamentList()
    skipSave.current = true
    applyLoadedTournament(created)
    skipSave.current = true
  }

  async function handleSetLive() {
    if (!tournamentId) return
    await setCurrentTournament(tournamentId)
    setIsLive(true)
    await refreshTournamentList()
  }

  async function handleDeleteTournament() {
    if (!tournamentId || deleteBusy) return
    const label =
      tournamentList.find((t) => t.id === tournamentId)?.name ??
      'this tournament'
    if (
      !window.confirm(
        `Delete "${label}" permanently? All matches and scores for this event will be lost.`,
      )
    ) {
      return
    }
    setDeleteBusy(true)
    try {
      await deleteTournament(tournamentId)
      skipSave.current = true
      const list = await refreshTournamentList()
      if (list.length === 0) {
        setTournamentId('')
        setIsLive(false)
        const fresh = [initialMatch()]
        setMatches(fresh)
        setActiveMatchId(fresh[0]?.id ?? '')
        setConfig({
          killPoint: 1,
          placementPoints: [...DEFAULT_PLACEMENT_POINTS],
        })
        setShowCreateTournament(true)
      } else {
        const pick = list.find((t) => t.isCurrent) ?? list[0]
        const data = await fetchTournamentById(pick.id)
        applyLoadedTournament(data)
        skipSave.current = true
      }
    } catch {
      window.alert('Could not delete tournament. Check admin access and API.')
    } finally {
      setDeleteBusy(false)
    }
  }

  useEffect(() => {
    if (!apiConnected) {
      setCloudLoaded(true)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        if (readOnly) {
          const data = await fetchLiveTournament()
          if (cancelled) return
          applyLoadedTournament(data)
        } else {
          let list: TournamentSummary[] = []
          try {
            list = await fetchTournamentList()
          } catch {
            const data = await fetchLiveTournament()
            if (cancelled) return
            applyLoadedTournament(data)
            return
          }
          if (cancelled) return
          setTournamentList(list)
          const pick = list.find((t) => t.isCurrent) ?? list[0]
          if (pick) {
            const data = await fetchTournamentById(pick.id)
            if (cancelled) return
            applyLoadedTournament(data)
          } else {
            const data = await fetchLiveTournament()
            if (cancelled) return
            applyLoadedTournament(data)
          }
        }
      } catch {
        /* keep local defaults */
      } finally {
        if (!cancelled) {
          setCloudLoaded(true)
          skipSave.current = true
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [apiConnected, readOnly])

  useEffect(() => {
    if (!canEdit || !apiConnected || !cloudLoaded || !tournamentId) return
    if (skipSave.current) {
      skipSave.current = false
      return
    }
    setSaveState('saving')
    const timer = window.setTimeout(() => {
      saveTournament(tournamentId, {
        ...config,
        matches,
      })
        .then(() => setSaveState('saved'))
        .catch(() => setSaveState('error'))
    }, 900)
    return () => window.clearTimeout(timer)
  }, [
    canEdit,
    apiConnected,
    cloudLoaded,
    tournamentId,
    config,
    matches,
  ])

  const activeMatch = matches.find((m) => m.id === activeMatchId) ?? matches[0]

  const teamLeaderboard = useMemo(
    () => aggregateTeams(matches, config),
    [matches, config],
  )
  const playerLeaderboard = useMemo(
    () => aggregatePlayers(matches, config),
    [matches, config],
  )
  const teamSeries = useMemo(
    () => buildTeamSeriesBreakdown(matches, config),
    [matches, config],
  )

  function updatePlacementPoint(index: number, value: number) {
    setConfig((c) => {
      const next = [...c.placementPoints]
      next[index] = value
      return { ...c, placementPoints: next }
    })
  }

  function addMatch() {
    const n = matches.length + 1
    const previous = matches[matches.length - 1]
    const m: MatchEntry = {
      id: createId(),
      label: `Match ${n}`,
      teams: previous
        ? cloneTeamsForNextMatch(previous.teams)
        : [emptyTeam()],
    }
    setMatches((prev) => [...prev, m])
    setActiveMatchId(m.id)
  }

  function updateMatch(matchId: string, patch: Partial<MatchEntry>) {
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, ...patch } : m)),
    )
  }

  function removeMatch(matchId: string) {
    setMatches((prev) => {
      const next = prev.filter((m) => m.id !== matchId)
      if (activeMatchId === matchId && next[0]) setActiveMatchId(next[0].id)
      return next.length ? next : [initialMatch()]
    })
  }

  function addTeam(matchId: string) {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, teams: [...m.teams, emptyTeam()] } : m,
      ),
    )
  }

  function updateTeam(
    matchId: string,
    teamId: string,
    patch: Partial<TeamEntry>,
  ) {
    setMatches((prev) =>
      prev.map((m) =>
        m.id !== matchId
          ? m
          : {
              ...m,
              teams: m.teams.map((t) =>
                t.id === teamId ? { ...t, ...patch } : t,
              ),
            },
      ),
    )
  }

  function removeTeam(matchId: string, teamId: string) {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, teams: m.teams.filter((t) => t.id !== teamId) }
          : m,
      ),
    )
  }

  function updatePlayer(
    matchId: string,
    teamId: string,
    playerId: string,
    patch: Partial<PlayerEntry>,
  ) {
    setMatches((prev) =>
      prev.map((m) =>
        m.id !== matchId
          ? m
          : {
              ...m,
              teams: m.teams.map((t) =>
                t.id !== teamId
                  ? t
                  : {
                      ...t,
                      players: t.players.map((p) =>
                        p.id === playerId ? { ...p, ...patch } : p,
                      ),
                    },
              ),
            },
      ),
    )
  }

  function addPlayer(matchId: string, teamId: string) {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m
        return {
          ...m,
          teams: m.teams.map((t) => {
            if (t.id !== teamId || !canAddPlayerToTeam(soldiers, t)) return t
            return { ...t, players: [...t.players, emptyPlayer()] }
          }),
        }
      }),
    )
  }

  function removePlayer(matchId: string, teamId: string, playerId: string) {
    setMatches((prev) =>
      prev.map((m) =>
        m.id !== matchId
          ? m
          : {
              ...m,
              teams: m.teams.map((t) =>
                t.id !== teamId
                  ? t
                  : {
                      ...t,
                      players: t.players.filter((p) => p.id !== playerId),
                    },
              ),
            },
      ),
    )
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Scrim & LAN" title="Tournament calculator">
        Configure kill and placement scoring, enter each match, and get live
        team and player totals across the whole series.
      </PageHeader>
      <p className="-mt-6 mb-4 text-sm text-slate-500">
        {readOnly ? (
          <>
            <span className="text-amber-400">View only</span> {' '}
            <Link to="/admin" className="text-blue-400 hover:text-blue-300">
              sign in
            </Link>{' '}
            and redeem an admin code to edit.
          </>
        ) : apiConnected ? (
          <>
            Cloud sync <span className="text-emerald-400">on</span>
            {saveState === 'saving' && ' · saving…'}
            {saveState === 'saved' && ' · saved'}
            {saveState === 'error' && ' · save failed (admin required?)'}
          </>
        ) : (
          <>
            Cloud sync <span className="text-amber-400">offline</span>
          </>
        )}
      </p>

      <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase">
            Tournaments
          </h2>
          {!readOnly && apiConnected ? (
            <button
              type="button"
              onClick={() => setShowCreateTournament(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
            >
              <span className="text-base leading-none text-emerald-400">+</span>
              New tournament
            </button>
          ) : !readOnly ? (
            <span className="text-xs text-amber-500/90">
              Cloud sync required to create events
            </span>
          ) : null}
        </div>

        <p className="mt-4 text-sm text-slate-500">
          {readOnly ? (
            <>
              Viewing the clan&apos;s live tournament matches and standings
              below. Admins sign in to create events.
            </>
          ) : (
            <>
              Use <span className="text-slate-400">New tournament</span> (top
              right) to add an event. Name, date, and prize pool (FCFA) are set
              in the form.
            </>
          )}
        </p>

        {!readOnly && apiConnected && (
          <div className="mt-4 flex flex-wrap items-end gap-3">
            {tournamentList.length > 0 ? (
              <label className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-xs">
                <span className="text-xs font-semibold text-slate-500">
                  Open saved
                </span>
                <select
                  value={tournamentId}
                  onChange={(e) => void switchTournament(e.target.value)}
                  className="w-full max-w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-semibold text-slate-200 outline-none focus:border-blue-500"
                >
                  {tournamentList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                      {t.isCurrent ? ' · live' : ''}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="text-sm text-slate-500">
                No saved events yet click{' '}
                <button
                  type="button"
                  onClick={() => setShowCreateTournament(true)}
                  className="font-medium text-emerald-400 underline-offset-2 hover:underline"
                >
                  New tournament
                </button>{' '}
                to start.
              </p>
            )}
            {isSuperAdmin && tournamentId && (
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => void handleDeleteTournament()}
                className="rounded-lg border border-red-900/80 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-950/40 disabled:opacity-50"
              >
                {deleteBusy ? 'Deleting…' : 'Delete'}
              </button>
            )}
            {tournamentId && !isLive && (
              <button
                type="button"
                onClick={() => void handleSetLive()}
                className="rounded-lg border border-blue-700 bg-blue-950/40 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-950/70"
              >
                Set as live
              </button>
            )}
            {isLive && (
              <span className="rounded-lg border border-emerald-800/80 bg-emerald-950/30 px-3 py-1.5 text-xs font-bold tracking-wide text-emerald-400 uppercase">
                Live
              </span>
            )}
          </div>
        )}
      </section>

      {showCreateTournament && (
        <CreateTournamentDialog
          onClose={() => setShowCreateTournament(false)}
          onCreated={(t) => void handleTournamentCreated(t)}
        />
      )}

      <fieldset
        disabled={readOnly}
        className={readOnly ? 'opacity-90 [&_*]:pointer-events-none' : ''}
      >
      <section className="mb-8 rounded-2xl border border-blue-900/50 bg-slate-900/80 p-4 ring-1 ring-cm-green/20 sm:mb-10 sm:p-6">
        <h2 className="text-lg font-bold text-white">Scoring rules</h2>
        <p className="mt-1 text-sm text-slate-500">
          Set points per kill and extra points for each finish position both
          are added into match and series totals.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <label className="block rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Points per kill
            </span>
            <input
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              value={config.killPoint}
              onChange={(e) =>
                setConfig((c) => ({
                  ...c,
                  killPoint: Math.max(0, Math.trunc(Number(e.target.value) || 0)),
                }))
              }
              className={scoringInputClass}
            />
            <p className="mt-2 text-xs text-slate-600">
              Each kill × this value for every player.
            </p>
          </label>

          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              Points per placement
            </span>
            <p className="mt-1 text-xs text-slate-600">
              Bonus added when a team finishes in that rank (1st = #1, etc.).
            </p>
            <button
              type="button"
              onClick={() =>
                setConfig((c) => ({
                  ...c,
                  placementPoints: [...DEFAULT_PLACEMENT_POINTS],
                }))
              }
              className="mt-2 text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              Reset placement defaults
            </button>
          </div>
        </div>

        <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/40 p-3 roster-table-scroll sm:max-h-none sm:p-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {config.placementPoints.slice(0, 15).map((pts, i) => (
              <label
                key={i}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-2"
              >
                <span className="text-sm font-semibold text-slate-300">
                  Placement #{i + 1}
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={pts}
                  onChange={(e) =>
                    updatePlacementPoint(i, Number(e.target.value) || 0)
                  }
                  className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-right font-bold text-emerald-200 outline-none focus:border-emerald-500"
                  aria-label={`Points for placement ${i + 1}`}
                />
              </label>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Player score = kills × kill points. Team match score = sum of player
          kill points + one placement bonus from the table above for that
          team&apos;s finish rank.
        </p>
      </section>

      <div className="grid gap-6 lg:gap-8 xl:grid-cols-[1fr_minmax(280px,340px)]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {matches.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveMatchId(m.id)}
                className={`btn-gaming btn-gaming-sm ${
                  m.id === activeMatch?.id
                    ? 'btn-gaming-primary'
                    : 'btn-gaming-secondary'
                }`}
              >
                {m.label}
              </button>
            ))}
            <button
              type="button"
              onClick={addMatch}
              className="rounded-lg border border-dashed border-blue-700 px-3 py-1.5 text-sm font-bold text-blue-400 hover:bg-blue-950/50"
            >
              + Match
            </button>
          </div>
          <p className="mb-4 text-xs text-slate-500">
            Adding a match copies every team and soldier from the previous match
            (kills reset). Swap players per team with the roster dropdown.
          </p>

          {activeMatch && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <input
                  value={activeMatch.label}
                  onChange={(e) =>
                    updateMatch(activeMatch.id, { label: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base font-bold text-white focus:border-blue-500 sm:w-auto sm:text-lg"
                />
                <button
                  type="button"
                  onClick={() => removeMatch(activeMatch.id)}
                  className="text-sm text-red-400 hover:text-red-300 sm:order-none"
                >
                  Remove match
                </button>
                <button
                  type="button"
                  onClick={() => addTeam(activeMatch.id)}
                  className="rounded-lg bg-blue-600/20 px-4 py-2 text-sm font-bold text-blue-300 hover:bg-blue-600/30 sm:ml-auto"
                >
                  + Team
                </button>
              </div>

              <div className="space-y-8">
                {activeMatch.teams.map((team) => {
                  const placementPts = teamPlacementPoints(
                    team,
                    config.placementPoints,
                  )
                  const killPts = teamKillPoints(team, config.killPoint)
                  const matchPts = teamMatchPoints(team, config)
                  return (
                    <div
                      key={team.id}
                      className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 sm:p-4"
                    >
                      <div className="mb-4 grid gap-3 sm:flex sm:flex-wrap sm:items-end">
                        <label className="min-w-0 flex-1 sm:min-w-[180px]">
                          <span className="text-xs text-slate-500">Team</span>
                          <input
                            value={team.name}
                            onChange={(e) =>
                              updateTeam(activeMatch.id, team.id, {
                                name: e.target.value,
                              })
                            }
                            placeholder="Team name"
                            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 font-semibold text-white"
                          />
                        </label>
                        <label>
                          <span className="text-xs text-slate-500">
                            Placement
                          </span>
                          <select
                            value={team.placement}
                            onChange={(e) =>
                              updateTeam(activeMatch.id, team.id, {
                                placement: Number(e.target.value),
                              })
                            }
                            className="mt-1 block rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                          >
                            {Array.from({ length: 15 }, (_, i) => i + 1).map(
                              (p) => (
                                <option key={p} value={p}>
                                  #{p}
                                </option>
                              ),
                            )}
                          </select>
                        </label>
                        <div className="grid grid-cols-3 gap-2 text-right sm:gap-3">
                          <div className="rounded-lg bg-slate-900/80 px-2 py-2 sm:px-3">
                            <p className="text-[10px] text-slate-500 uppercase">
                              Kill pts
                            </p>
                            <p className="text-lg font-black tabular-nums text-blue-300">
                              {formatPoints(killPts)}
                            </p>
                          </div>
                          <div className="rounded-lg bg-emerald-950/40 px-2 py-2 sm:px-3">
                            <p className="text-[10px] text-emerald-500/80 uppercase">
                              Plc #{team.placement}
                            </p>
                            <p className="text-lg font-black tabular-nums text-emerald-300">
                              +{formatPoints(placementPts)}
                            </p>
                          </div>
                          <div className="rounded-lg bg-blue-950/50 px-2 py-2 sm:px-3">
                            <p className="text-[10px] text-blue-400/80 uppercase">
                              Total
                            </p>
                            <p className="text-lg font-black tabular-nums text-white">
                              {formatPoints(matchPts)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            removeTeam(activeMatch.id, team.id)
                          }
                          className="text-xs text-slate-500 hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                      <table className="w-full min-w-[280px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase">
                            <th className="pb-2 font-semibold">Player</th>
                            <th className="pb-2 font-semibold">Kills</th>
                            <th className="pb-2 text-right font-semibold">
                              Score pts
                            </th>
                            <th className="pb-2 w-16" />
                          </tr>
                        </thead>
                        <tbody>
                          {team.players.length === 0 && (
                            <tr>
                              <td
                                colSpan={4}
                                className="py-4 text-center text-sm text-slate-500"
                              >
                                No players yet add a soldier from the roster
                                below.
                              </td>
                            </tr>
                          )}
                          {team.players.map((p) => {
                            const options = availableSoldiersForTeam(
                              soldiers,
                              team,
                              p.id,
                            )
                            return (
                            <tr key={p.id} className="border-b border-slate-800/60">
                              <td className="py-2 pr-2">
                                <select
                                  value={p.name}
                                  onChange={(e) =>
                                    updatePlayer(
                                      activeMatch.id,
                                      team.id,
                                      p.id,
                                      { name: e.target.value },
                                    )
                                  }
                                  className="w-full min-w-[10rem] rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-white focus:border-blue-500"
                                >
                                  <option value="">Select soldier…</option>
                                  {p.name &&
                                    !options.some(
                                      (s) => s.gamertag === p.name,
                                    ) && (
                                      <option value={p.name}>{p.name}</option>
                                    )}
                                  {options.map((s) => (
                                    <option key={s.id} value={s.gamertag}>
                                      {s.gamertag}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2">
                                <input
                                  type="number"
                                  min={0}
                                  value={p.kills}
                                  onChange={(e) =>
                                    updatePlayer(
                                      activeMatch.id,
                                      team.id,
                                      p.id,
                                      {
                                        kills: Number(e.target.value) || 0,
                                      },
                                    )
                                  }
                                  className="w-20 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white"
                                />
                              </td>
                              <td className="py-2 text-right tabular-nums font-bold text-white">
                                {p.name.trim()
                                  ? formatPoints(
                                      playerMatchPointsTotal(
                                        p,
                                        team,
                                        config,
                                      ),
                                    )
                                  : '—'}
                              </td>
                              <td className="py-2 pl-2 text-right">
                                <button
                                  type="button"
                                  onClick={() =>
                                    removePlayer(
                                      activeMatch.id,
                                      team.id,
                                      p.id,
                                    )
                                  }
                                  className="text-xs text-slate-500 hover:text-red-400"
                                  aria-label="Remove player"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          )})}
                          {team.players.some((p) => p.name.trim()) && (
                            <tr className="border-t border-slate-700 bg-slate-900/50 font-bold">
                              <td
                                className="py-3 pr-2 text-xs tracking-wide text-slate-400 uppercase"
                                colSpan={2}
                              >
                                Team match total
                              </td>
                              <td className="py-3 text-right tabular-nums text-white">
                                <span className="text-blue-300">
                                  {formatPoints(killPts)}
                                </span>
                                <span className="text-slate-500"> + </span>
                                <span className="text-emerald-300">
                                  {formatPoints(placementPts)} plc
                                </span>
                                <span className="text-slate-500"> = </span>
                                {formatPoints(matchPts)}
                              </td>
                              <td />
                            </tr>
                          )}
                        </tbody>
                      </table>
                      </div>
                      <button
                        type="button"
                        onClick={() => addPlayer(activeMatch.id, team.id)}
                        disabled={!canAddPlayerToTeam(soldiers, team)}
                        className="mt-2 text-xs font-semibold text-blue-400 hover:text-blue-300 disabled:cursor-not-allowed disabled:text-slate-600"
                      >
                        + Add player from roster
                      </button>
                      {team.players.length >= MAX_PLAYERS_PER_TEAM && (
                        <p className="mt-1 text-xs text-slate-500">
                          Maximum {MAX_PLAYERS_PER_TEAM} players per team.
                        </p>
                      )}
                      {team.players.length < MAX_PLAYERS_PER_TEAM &&
                        !canAddPlayerToTeam(soldiers, team) &&
                        availableSoldiersForTeam(soldiers, team).length ===
                          0 &&
                        team.players.every((p) => p.name.trim()) && (
                          <p className="mt-1 text-xs text-slate-600">
                            All roster soldiers are on this team.
                          </p>
                        )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4 sm:space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Leaderboard
            title="Team standings"
            subtitle="All matches combined"
            rows={teamLeaderboard.map((t, i) => ({
              rank: i + 1,
              name: t.name || 'Unnamed team',
              primary: t.totalPoints,
              secondary: `${t.totalKills} kills · ${t.matchesPlayed} matches`,
            }))}
          />
          <Leaderboard
            title="Player standings"
            subtitle="Kill points across series"
            trophyTopThree
            rows={playerLeaderboard.map((p, i) => ({
              rank: i + 1,
              name: p.name,
              primary: p.totalPoints,
              secondary: `${p.totalKills} kills · ${p.matchesPlayed} matches`,
            }))}
          />
        </aside>
      </div>

      <TeamSeriesResults matches={matches} rows={teamSeries} />
      </fieldset>
    </PageShell>
  )
}

function TeamSeriesResults({
  matches,
  rows,
}: {
  matches: MatchEntry[]
  rows: ReturnType<typeof buildTeamSeriesBreakdown>
}) {
  const leader = rows[0]
  const hasData = rows.some((r) => r.totalPoints > 0)

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-blue-900/50 bg-slate-900/80 p-1 ring-1 ring-cm-yellow/15 sm:mt-12">
      <div className="cm-card-top h-1 w-full" />
      <div className="bg-slate-950/90 p-4 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.35em] text-blue-400 uppercase">
              Series totals
            </p>
            <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
              Overall team results
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Points from every match add up here automatically (player kills +
              placement per match).
            </p>
          </div>
          {leader && hasData && (
            <div className="rounded-xl border border-cm-yellow/40 bg-cm-yellow/10 px-4 py-3 text-center sm:text-left">
              <p className="text-[10px] font-bold tracking-widest text-cm-yellow uppercase">
                Overall leader
              </p>
              <p className="mt-1 text-lg font-black text-white">
                🏆 {leader.name}
              </p>
              <p className="text-sm font-bold tabular-nums text-blue-200">
                {formatPoints(leader.totalPoints)} pts ·{' '}
                {formatPoints(leader.totalKills)} kills
              </p>
            </div>
          )}
        </div>

        {!hasData ? (
          <p className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 px-4 py-8 text-center text-sm text-slate-500">
            Enter team names and match scores abovealso this table fills in as you
            go.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800 roster-table-scroll">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950 text-xs uppercase tracking-wide text-slate-500">
                  <th className="sticky left-0 z-10 bg-slate-950 px-4 py-3 font-semibold">
                    Team
                  </th>
                  {matches.map((m) => (
                    <th
                      key={m.id}
                      className="px-3 py-3 text-right font-semibold whitespace-nowrap"
                    >
                      {m.label || 'Match'}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold text-blue-300">
                    Series total
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.name}
                    className={`border-b border-slate-800/80 ${
                      index === 0
                        ? 'bg-cm-yellow/5'
                        : index % 2 === 0
                          ? 'bg-slate-950/30'
                          : ''
                    }`}
                  >
                    <td className="sticky left-0 z-10 bg-inherit px-4 py-3 font-bold text-white">
                      <span className="mr-2 text-slate-500">
                        {index === 0 ? '🥇' : index + 1}
                      </span>
                      {row.name}
                    </td>
                    {matches.map((m) => {
                      const pts = row.pointsByMatchId[m.id]
                      return (
                        <td
                          key={m.id}
                          className="px-3 py-3 text-right tabular-nums text-slate-300"
                        >
                          {pts != null && pts > 0
                            ? formatPoints(pts)
                            : '—'}
                        </td>
                      )
                    })}
                    <td className="px-4 py-3 text-right text-base font-black tabular-nums text-blue-300">
                      {formatPoints(row.totalPoints)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

const TROPHY_BY_RANK: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

function standingRankBadgeClass(rank: number, trophyTopThree: boolean): string {
  if (trophyTopThree && rank <= 3) {
    if (rank === 1) {
      return 'bg-cm-yellow/20 text-lg ring-1 ring-cm-yellow/50'
    }
    if (rank === 2) {
      return 'bg-slate-400/15 text-lg ring-1 ring-slate-400/40'
    }
    return 'bg-amber-700/20 text-lg ring-1 ring-amber-600/40'
  }
  if (rank === 1) {
    return 'bg-blue-600 text-white text-xs font-black'
  }
  return 'bg-slate-800 text-slate-400 text-xs font-black'
}

function Leaderboard({
  title,
  subtitle,
  rows,
  trophyTopThree = false,
}: {
  title: string
  subtitle: string
  trophyTopThree?: boolean
  rows: {
    rank: number
    name: string
    primary: number
    secondary: string
  }[]
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5">
      <h3 className="font-bold text-white">{title}</h3>
      <p className="text-xs text-slate-500">{subtitle}</p>
      <ol className="mt-4 max-h-80 space-y-2 overflow-y-auto">
        {rows.length === 0 ? (
          <li className="text-sm text-slate-500">No data yet.</li>
        ) : (
          rows.map((row) => (
            <li
              key={`${row.rank}-${row.name}`}
              className="flex items-center gap-3 rounded-lg bg-slate-950/60 px-3 py-2"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${standingRankBadgeClass(row.rank, trophyTopThree)}`}
                aria-label={`Rank ${row.rank}`}
              >
                {trophyTopThree && row.rank <= 3
                  ? TROPHY_BY_RANK[row.rank]
                  : row.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {row.name}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {row.secondary}
                </p>
              </div>
              <span className="font-black tabular-nums text-blue-300">
                {formatPoints(row.primary)}
              </span>
            </li>
          ))
        )}
      </ol>
    </div>
  )
}
