'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { headers } from 'next/headers'

interface AuthResult {
  success: boolean
  error?: string
  redirectTo?: string
}

/**
 * Register a new user
 */
export async function signup(data: { email: string; password: string; fullName?: string }): Promise<AuthResult> {
  try {
    const { email, password, fullName } = data
    const supabase = await createClient()
    const origin = (await headers()).get('origin')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Signup error:', error.message)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      redirectTo: '/login?message=Check email to continue sign in process',
    }
  } catch (err: any) {
    console.error('Fatal Signup Error:', err)
    return { success: false, error: 'Hubo un error de conexión. Por favor intenta de nuevo.' }
  }
}

/**
 * Log in existing user
 */
export async function login(data: { email: string; password: string }): Promise<AuthResult> {
  try {
    const { email, password } = data
    const supabase = await createClient()

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
      redirectTo: '/dashboard',
    }
  } catch (err: any) {
    console.error('Fatal Login Error:', err)
    return { success: false, error: 'Error de respuesta del servidor (Fetch failed)' }
  }
}

/**
 * Log out current user
 */
export async function logout(): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      redirectTo: '/login',
    }
  } catch (err) {
    return { success: false, error: 'Error al cerrar sesión' }
  }
}
