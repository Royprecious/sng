import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import WebSocket from 'ws'

function readSupabaseEnv() {
  const url = (
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    ''
  ).trim()
  const serviceKey = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_KEY ??
    ''
  ).trim()
  return { url, serviceKey }
}

/** Safe for /api/health — does not throw. */
export function supabaseEnvStatus(): {
  hasUrl: boolean
  hasServiceKey: boolean
} {
  const { url, serviceKey } = readSupabaseEnv()
  return { hasUrl: Boolean(url), hasServiceKey: Boolean(serviceKey) }
}

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (client) return client
  const { url, serviceKey } = readSupabaseEnv()
  if (!url || !serviceKey) {
    const status = supabaseEnvStatus()
    throw new Error(
      'Missing Supabase server env. On Vercel set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY ' +
        '(service_role / secret key — not the publishable key), enable Production, then redeploy. ' +
        `Detected: url=${status.hasUrl}, serviceKey=${status.hasServiceKey}`,
    )
  }
  client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: {
      transport: WebSocket as unknown as typeof globalThis.WebSocket,
    },
  })
  return client
}

/** Lazy client — avoids crashing the whole function at import time. */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const real = getSupabase()
    const value = Reflect.get(real, prop, receiver)
    return typeof value === 'function' ? value.bind(real) : value
  },
})
