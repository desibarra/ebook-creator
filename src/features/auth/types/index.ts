/**
 * Authentication Types
 * Types for user authentication and session management
 */

export interface User {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  user: User
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: string | null
}

export interface SignupData {
  email: string
  password: string
  fullName: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  error?: string
  redirectTo?: string
}
