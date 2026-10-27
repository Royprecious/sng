import 'dotenv/config'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sqlPath = join(__dirname, '../../supabase/migrations/run_all.sql')

const connectionString =
  process.env.DATABASE_URL ?? process.env.SUPABASE_DB_URL

async function main() {
  if (!connectionString) {
    console.error(
      'Missing DATABASE_URL or SUPABASE_DB_URL in server/.env\n' +
        'Get it from Supabase → Project Settings → Database → Connection string (URI)',
    )
    process.exit(1)
  }

  const sql = readFileSync(sqlPath, 'utf8')
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  await client.connect()
  try {
    await client.query(sql)
    console.log('Migration completed successfully.')
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
