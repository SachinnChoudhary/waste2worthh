import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://waeayucnkgdeezariaqy.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZWF5dWNua2dkZWV6YXJpYXF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNjE3MDAsImV4cCI6MjEwMjYzNzcwMH0.FXsCJZ855mwfaX0EHGAZg7Q-WyWLlQxH5cL87zB8mK0'

export const isSupabaseLive = Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'))

export const supabase = isSupabaseLive
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
