import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchSoldiers, checkApiHealth } from '../lib/api'
import { type Soldier, type ClanRank, type TierId } from '../data/clan'

type ClanContextValue = {
  soldiers: Soldier[]
  loading: boolean
  apiConnected: boolean
  refreshSoldiers: () => Promise<void>
}

const ClanContext = createContext<ClanContextValue | null>(null)

function mapApiSoldier(raw: {
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
}): Soldier {
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

export function ClanProvider({ children }: { children: ReactNode }) {
  const [soldiers, setSoldiers] = useState<Soldier[]>([])
  const [loading, setLoading] = useState(true)
  const [apiConnected, setApiConnected] = useState(false)

  const refreshSoldiers = useCallback(async () => {
    setLoading(true)
    try {
      const ok = await checkApiHealth()
      setApiConnected(ok)
      if (!ok) {
        setSoldiers([])
        return
      }
      const data = await fetchSoldiers()
      setSoldiers(data.map(mapApiSoldier))
    } catch {
      setApiConnected(false)
      setSoldiers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshSoldiers()
  }, [refreshSoldiers])

  const value = useMemo(
    () => ({ soldiers, loading, apiConnected, refreshSoldiers }),
    [soldiers, loading, apiConnected, refreshSoldiers],
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
