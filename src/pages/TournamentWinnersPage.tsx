import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { GamingButton } from '../components/GamingButton'
import { PageHeader } from '../components/PageHeader'
import { PageShell } from '../components/PageShell'
import {
  TeamPodiumBoard,
  type PodiumSlot,
} from '../components/TeamPodiumBoard'
import { useClan } from '../context/ClanContext'
import { fetchActiveLiveTournament } from '../lib/api'
import { downloadCardPng, shareCardPng } from '../lib/exportMemberCardPng'
import type { PodiumRank } from '../lib/teamPodiumTheme'
import {
  aggregateTeams,
  DEFAULT_PLACEMENT_POINTS,
  type MatchEntry,
  type ScoringConfig,
} from '../lib/tournament'

function formatEventDate(iso: string | null | undefined): string | undefined {
  if (!iso) return undefined
  const parts = iso.split('-').map(Number)
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return iso
  const [y, m, d] = parts
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function TournamentWinnersPage() {
  const { apiConnected, ready: clanReady } = useClan()
  const exportRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [exportBusy, setExportBusy] = useState(false)
  const [exportHint, setExportHint] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tournamentName, setTournamentName] = useState('Tournament')
  const [eventDateLabel, setEventDateLabel] = useState<string | undefined>()
  const [config, setConfig] = useState<ScoringConfig>({
    killPoint: 1,
    placementPoints: [...DEFAULT_PLACEMENT_POINTS],
  })
  const [matches, setMatches] = useState<MatchEntry[]>([])

  useEffect(() => {
    if (!clanReady) return
    let cancelled = false
    setLoading(true)
    ;(async () => {
      if (!apiConnected) {
        setError(
          'Cloud sync is offline. Start the API server (npm run dev:server) and refresh.',
        )
        setLoading(false)
        return
      }
      try {
        const data = await fetchActiveLiveTournament()
        if (cancelled) return
        setTournamentName(data.name?.trim() || 'Tournament')
        setEventDateLabel(formatEventDate(data.eventDate))
        setConfig({
          killPoint: data.killPoint,
          placementPoints: data.placementPoints?.length
            ? data.placementPoints
            : [...DEFAULT_PLACEMENT_POINTS],
        })
        setMatches(
          Array.isArray(data.matches) ? (data.matches as MatchEntry[]) : [],
        )
        setError(null)
      } catch (e) {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : ''
        if (msg === 'NO_LIVE_TOURNAMENT') {
          setError(
            'No active tournament is set. On the Tournament page, open the event you want and click Set as live — Winners only shows that event.',
          )
          setMatches([])
          return
        }
        setError(
          msg.includes('event_date') || msg.includes('schema cache')
            ? `${msg} Run supabase/migrations/007_tournament_schema_fix.sql in Supabase, then refresh.`
            : msg || 'Could not load tournament data. Check the API and Supabase.',
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [apiConnected, clanReady])

  const topThree = useMemo(() => {
    return aggregateTeams(matches, config).slice(0, 3)
  }, [matches, config])

  const podiumSlots: PodiumSlot[] = useMemo(() => {
    return ([1, 2, 3] as PodiumRank[]).flatMap((rank) => {
      const team = topThree[rank - 1]
      if (!team) return []
      return [
        {
          rank,
          data: {
            teamName: team.name,
            totalPoints: team.totalPoints,
            totalKills: team.totalKills,
            matchesPlayed: team.matchesPlayed,
            tournamentName,
            eventDateLabel,
          },
        },
      ]
    })
  }, [topThree, tournamentName, eventDateLabel])

  async function runPodiumExport(mode: 'share' | 'download') {
    const node = exportRef.current
    if (!node || exportBusy) return
    setExportBusy(true)
    setExportHint(null)
    const fileBase = `podium-${tournamentName.replace(/\s+/g, '-')}`
    const title = `${tournamentName} · Top teams · SNG`
    try {
      if (mode === 'share') {
        const result = await shareCardPng(node, fileBase, title)
        setExportHint(
          result === 'shared'
            ? 'Shared!'
            : 'Saved to your device — share from photos.',
        )
      } else {
        await downloadCardPng(node, fileBase)
        setExportHint('Downloaded podium image')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setExportHint(
        err instanceof Error ? err.message : 'Could not export image',
      )
    } finally {
      setExportBusy(false)
      window.setTimeout(() => setExportHint(null), 4500)
    }
  }

  return (
    <PageShell>
      <PageHeader eyebrow="Results" title="Top teams">
        One shareable podium image for the clan&apos;s{' '}
        <span className="text-emerald-400/90">active</span> tournament only
        not other saved events.
      </PageHeader>

      <p className="-mt-6 mb-8 text-sm text-slate-500">
        Standings come from whichever tournament is marked{' '}
        <span className="text-emerald-400/90">Live</span> on the{' '}
        <Link to="/tournament" className="text-blue-400 hover:text-blue-300">
          Tournament
        </Link>{' '}
        page (<strong className="font-medium text-slate-400">Set as live</strong>
        ). Other events in the dropdown are ignored here. Totals = kill points
        + placement bonuses across all matches in that event.
      </p>

      {(!clanReady || loading) && (
        <p className="text-sm text-slate-500">Loading standings…</p>
      )}

      {clanReady && !loading && error && (
        <p className="rounded-xl border border-amber-900/50 bg-amber-950/20 px-4 py-3 text-sm text-amber-200/90">
          {error}
        </p>
      )}

      {clanReady && !loading && !error && topThree.length === 0 && (
        <p className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
          No team scores yet. Enter matches on the{' '}
          <Link to="/tournament" className="font-semibold text-blue-400">
            tournament page
          </Link>{' '}
          and set an event as live.
        </p>
      )}

      {clanReady && !loading && !error && podiumSlots.length > 0 && (
        <>
          <TeamPodiumBoard slots={podiumSlots} />

          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <GamingButton
                type="button"
                disabled={exportBusy}
                onClick={() => void runPodiumExport('share')}
                className="touch-manipulation btn-gaming-block"
              >
                {exportBusy ? '…' : 'Share podium'}
              </GamingButton>
              <GamingButton
                type="button"
                variant="secondary"
                disabled={exportBusy}
                onClick={() => void runPodiumExport('download')}
                className="touch-manipulation btn-gaming-block"
              >
                Save image
              </GamingButton>
            </div>
            <p className="text-center text-[11px] text-slate-500">
              One PNG with every team on the podium 2nd, 1st, 3rd left to
              right.
            </p>
            {exportHint && (
              <p className="text-center text-sm font-semibold text-emerald-400">
                {exportHint}
              </p>
            )}
          </div>

          <div
            className="export-capture-host"
            aria-hidden
            inert
          >
            <TeamPodiumBoard
              ref={exportRef}
              slots={podiumSlots}
              exportLayout
            />
          </div>
        </>
      )}

      {clanReady && !loading && !error && topThree.length > 0 && topThree.length < 3 && (
        <p className="mt-6 text-center text-xs text-slate-600">
          Only {topThree.length} team
          {topThree.length === 1 ? '' : 's'} scored so far — the image includes
          whoever is on the board now.
        </p>
      )}
    </PageShell>
  )
}
