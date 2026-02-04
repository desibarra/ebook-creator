'use client'

import { createClient } from '@/shared/lib/supabase/client'
import { useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function SupabaseProvider({ children }: Props) {
  // Initialize the client once and make it available if needed 
  // (though createClient from libs is also valid)
  const [supabase] = useState(() => createClient())

  return (
    <>
      {children}
    </>
  )
}
