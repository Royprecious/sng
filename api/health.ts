/**
 * Standalone Vercel function — does not load Express.
 * Use /api/health to verify env vars reach serverless functions.
 */
export default function handler(
  _req: unknown,
  res: {
    setHeader: (name: string, value: string) => void
    status: (code: number) => { end: (body: string) => void }
  },
) {
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

  const supabaseKeyNames = Object.keys(process.env).filter((k) =>
    k.includes('SUPABASE'),
  )

  res.setHeader('Content-Type', 'application/json')
  res.status(200).end(
    JSON.stringify({
      ok: true,
      probe: 'vercel-function-env',
      supabaseEnv: {
        hasUrl: Boolean(url),
        hasServiceKey: Boolean(serviceKey),
      },
      supabaseKeyNames,
      vercel: Boolean(process.env.VERCEL),
    }),
  )
}
