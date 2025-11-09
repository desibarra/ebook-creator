'use server'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AuthResult {
  success: boolean
  error?: string
  redirectTo?: string
}

/**
 * Register a new user
 */
export async function signup(data: { email: string; password: string; fullName?: string }): Promise<AuthResult> {
  const { email, password, fullName } = data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    console.error('Signup error:', error.message)
    return { success: false, error: error.message }
  }

  return {
    success: true,
    redirectTo: '/login',
  }
}

/**
 * Log in existing user
 */
export async function login(data: { email: string; password: string }): Promise<AuthResult> {
  const { email, password } = data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error.message)
    return { success: false, error: error.message }
  }

  return {
    success: true,
    redirectTo: '/',
  }
}

/**
 * Log out current user
 */
export async function logout(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Logout error:', error.message)
    return { success: false, error: error.message }
  }

  return {
    success: true,
    redirectTo: '/login',
  }
}
