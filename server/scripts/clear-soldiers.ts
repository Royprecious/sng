import 'dotenv/config'
import { supabase } from '../src/supabase.js'

async function main() {
  const { error } = await supabase.from('soldiers').delete().gte('sort_order', 0)
  if (error) {
    console.error('Clear failed:', error.message)
    process.exit(1)
  }
  console.log('Cleared all soldiers from Supabase.')
}

main()
