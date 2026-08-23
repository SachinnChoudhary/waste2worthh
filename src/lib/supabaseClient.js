import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseLive = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')
)

if (!isSupabaseLive) {
  console.warn(
    '⚠️  Supabase is not configured — running in mock/local mode.\n' +
    '   Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env to connect to a live database.'
  )
}

export const supabase = isSupabaseLive
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
