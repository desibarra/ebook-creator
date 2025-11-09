import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/shared/types/database'

/**
 * Creates a Supabase client for use in Client Components
 * This client automatically handles cookie management in the browser
 *
 * IMPORTANT: Only use this in Client Components (with 'use client' directive)
 *
 * @returns Supabase browser client instance
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
