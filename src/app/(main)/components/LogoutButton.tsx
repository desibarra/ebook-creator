/**
 * Logout Button Component
 * Client component to handle logout action
 */

'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function LogoutButton() {
  const { handleLogout, isPending } = useAuth()

  return (
    <Button 
      variant="ghost" 
      size="sm"
      className="text-slate-600 hover:text-slate-900"
      onClick={() => handleLogout()}
      disabled={isPending}
    >
      <LogOut className="h-4 w-4 mr-2" />
      {isPending ? 'Logging out...' : 'Logout'}
    </Button>
  )
}
