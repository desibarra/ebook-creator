/**
 * Next.js Middleware
 * Handles authentication and route protection
 */

import { type NextRequest } from 'next/server'
import { updateSession } from '@/shared/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Update user session (refresh if needed)
  const { response, supabase } = await updateSession(request)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/signup')
  const isProtectedPage =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/editor')

  // Redirect authenticated users away from auth pages
  if (user && isAuthPage) {
    return Response.redirect(new URL('/dashboard', request.url))
  }

  // Redirect unauthenticated users to login for protected pages
  if (!user && isProtectedPage) {
    return Response.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
