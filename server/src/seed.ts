import 'dotenv/config'
import { supabase } from './supabase.js'
import { seedSoldiers } from './seed-data.js'

async function main() {
  if (seedSoldiers.length === 0) {
    console.log('No seed soldiers configured — roster stays empty until you add via the site.')
    return
  }
  const { error } = await supabase.from('soldiers').upsert(
    seedSoldiers.map((s) => ({ ...s })),
    { onConflict: 'gamertag' },
  )
  if (error) {
    console.error('Seed failed:', error.message)
    process.exit(1)
  }
  console.log(`Seeded ${seedSoldiers.length} soldiers into Supabase.`)
}

main()
