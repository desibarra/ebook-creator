/**
 * Main App Layout
 * Layout for authenticated pages (dashboard, editor, etc.)
 */

import { BookOpen } from 'lucide-react'
import Link from 'next/link'
import { LogoutButton } from './components/LogoutButton'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">eBook Creator</span>
            </Link>
            
            <nav className="flex items-center gap-6">
              <Link 
                href="/dashboard" 
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard" 
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                My eBooks
              </Link>
              <div className="w-px h-6 bg-slate-200" />
              <LogoutButton />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
