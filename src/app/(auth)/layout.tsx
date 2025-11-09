/**
 * Auth Layout
 * Layout for authentication pages (login, signup)
 * Centered layout without navigation
 */

import { BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted">
      {/* Logo */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <BookOpen className="h-6 w-6" />
          <span className="text-xl font-bold">eBook Creator</span>
        </Link>
      </div>

      {/* Content - Centered */}
      <div className="flex-1 flex items-center justify-center px-4">
        {children}
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
        <p>&copy; 2025 eBook Creator. All rights reserved.</p>
      </div>
    </div>
  )
}
