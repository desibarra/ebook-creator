import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/shared/types/database'

/**
 * Creates a Supabase client for use in Server Components and Server Actions
 * Handles cookie management on the server side (Next.js 15 compatible)
 *
 * IMPORTANT: Only use this in Server Components or Server Actions
 *
 * @returns Supabase server client instance
 */
export async function createClient() {
  const cookieStore = await cookies() // 👈 Ahora usamos await

  // WORKAROUND: Definir opciones explícitas de fetch para evitar problemas en Vercel Edge/Serverless
  // "AuthRetryableFetchError" suele ser un error de red/DNS intermitente en Vercel
  const options = {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Ignorar error de escritura en Server Components
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // Ignorar error de escritura en Server Components
        }
      },
    },
    auth: {
      detectSessionInUrl: true,
      flowType: 'pkce',
      // Forzar fetch nativo ignorando ciertos comportamientos de next
      persistSession: true,
      autoRefreshToken: true,
    }
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    options as any // Casting as options type might differ slightly in versions
  )
}
