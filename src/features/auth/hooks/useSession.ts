/**
 * useSession Hook
 * Client-side hook for accessing current user session
 *
 * IMPORTANT: Only use this in Client Components
 */

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/shared/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useSession() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  }
}
