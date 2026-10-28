type Entry = { data: unknown; at: number }

const store = new Map<string, Entry>()

export function getCached<T>(key: string, maxAgeMs: number): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() - entry.at > maxAgeMs) return null
  return entry.data as T
}

export function setCached<T>(key: string, data: T): void {
  store.set(key, { data, at: Date.now() })
}

export function invalidateCached(keyOrPrefix: string): void {
  if (!store.has(keyOrPrefix)) {
    for (const key of store.keys()) {
      if (key.startsWith(keyOrPrefix)) store.delete(key)
    }
    return
  }
  store.delete(keyOrPrefix)
}

export const CACHE_TTL = {
  health: 60_000,
  soldiers: 90_000,
  tournamentList: 45_000,
  tournament: 30_000,
  activeLive: 30_000,
} as const
