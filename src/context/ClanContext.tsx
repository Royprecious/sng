import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { CACHE_TTL, getCached } from '../lib/apiCache'
import { fetchSoldiers, checkApiHealth } from '../lib/api'
import { type Soldier, type ClanRank, type TierId } from '../data/clan'

type ClanContextValue = {
  soldiers: Soldier[]
  loading: boolean
  /** First API bootstrap finished (avoids false "offline" on other pages). */
  ready: boolean
  apiConnected: boolean
  refreshSoldiers: (options?: { force?: boolean }) => Promise<void>
}

const ClanContext = createContext<ClanContextValue | null>(null)

type ApiSoldierRow = {
  id: string
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

function mapApiSoldier(raw: ApiSoldierRow): Soldier {
  const combat = (raw.combatRole ?? 'support').toLowerCase() as Soldier['combatRole']
  return {
    id: raw.id,
    gamertag: raw.gamertag,
    role: raw.role as Soldier['role'],
    clanRank: raw.clanRank as ClanRank,
    tier: raw.tier as TierId,
    specialty: raw.specialty,
    kd: raw.kd,
    combatRole: combat,
    region: raw.region,
    avatar: raw.avatar,
    sortOrder: raw.sortOrder ?? 0,
  }
}

function readSoldiersCache(): Soldier[] {
  const cached = getCached<ApiSoldierRow[]>('soldiers', CACHE_TTL.soldiers)
  return cached ? cached.map(mapApiSoldier) : []
}

export function ClanProvider({ children }: { children: ReactNode }) {
  const initialCached = readSoldiersCache()
  const [soldiers, setSoldiers] = useState<Soldier[]>(initialCached)
  const [loading, setLoading] = useState(initialCached.length === 0)
  const [ready, setReady] = useState(false)
  const [apiConnected, setApiConnected] = useState(initialCached.length > 0)
  const mounted = useRef(false)
  const soldiersRef = useRef(soldiers)
  soldiersRef.current = soldiers

  const refreshSoldiers = useCallback(async (options?: { force?: boolean }) => {
    const force = options?.force ?? false
    if (soldiersRef.current.length === 0 && !force) setLoading(true)

    try {
      const ok = await checkApiHealth()
      setApiConnected(ok)
      if (!ok) {
        setSoldiers((current) => (current.length === 0 ? [] : current))
        return
      }
      const data = await fetchSoldiers({ force })
      setSoldiers(data.map(mapApiSoldier))
    } catch {
      setApiConnected(false)
      setSoldiers((current) => (current.length === 0 ? [] : current))
    } finally {
      setLoading(false)
      setReady(true)
    }
  }, [])

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true
    void refreshSoldiers({ force: false })
  }, [refreshSoldiers])

  const value = useMemo(
    () => ({ soldiers, loading, ready, apiConnected, refreshSoldiers }),
    [soldiers, loading, ready, apiConnected, refreshSoldiers],
  )

  return <ClanContext.Provider value={value}>{children}</ClanContext.Provider>
}

export function useClan(): ClanContextValue {
  const ctx = useContext(ClanContext)
  if (!ctx) {
    throw new Error('useClan must be used within ClanProvider')
  }
  return ctx
}
