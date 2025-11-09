'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { signup, login, logout } from '../services/authService'
import type { SignupFormData, LoginFormData } from '../types/schemas'

export function useAuth() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  /**
   * Sign up new user
   */
  const handleSignup = async (data: SignupFormData) => {
    setError(null)

    startTransition(async () => {
      const result = await signup(data)

      if (!result.success) {
        setError(result.error || 'Signup failed')
        toast.error(result.error || 'Signup failed')
        return
      }

      toast.success('Account created successfully!')
      if (result.redirectTo) {
        router.push(result.redirectTo)
        router.refresh()
      }
    })
  }

  /**
   * Log in existing user
   */
  const handleLogin = async (data: LoginFormData) => {
    setError(null)

    startTransition(async () => {
      const result = await login(data)

      if (!result.success) {
        setError(result.error || 'Login failed')
        toast.error(result.error || 'Login failed')
        return
      }

      toast.success('Welcome back!')
      if (result.redirectTo) {
        router.push(result.redirectTo)
        router.refresh()
      }
    })
  }

  /**
   * Log out user
   */
  const handleLogout = async () => {
    setError(null)

    startTransition(async () => {
      const result = await logout()

      if (!result.success) {
        setError(result.error || 'Logout failed')
        toast.error(result.error || 'Logout failed')
        return
      }

      toast.success('Logged out successfully')
      if (result.redirectTo) {
        router.push(result.redirectTo)
        router.refresh()
      }
    })
  }

  return {
    handleSignup,
    handleLogin,
    handleLogout,
    isPending,
    error,
  }
}
