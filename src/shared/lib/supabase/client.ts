import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/shared/types/database'

/**
 * Creates a Supabase client for use in Client Components
 */
export function createClient() {
  // Limpiamos la URL por si acaso hay espacios invisibles
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()


  return createBrowserClient<Database>(
    supabaseUrl!,
    supabaseKey!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  )
}
