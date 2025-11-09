'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function SupabaseProvider({ children }: Props) {
  const supabase = createClientComponentClient()
  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  )
}
