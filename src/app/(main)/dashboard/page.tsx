/**
 * Dashboard Page - Premium Design
 * Main dashboard for authenticated users
 */

import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'
import { BookOpen, Palette, Download, Zap } from 'lucide-react'

export const metadata = {
  title: 'Dashboard - eBook Creator',
  description: 'Create and manage your eBooks',
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Welcome to Your
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              eBook Studio
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Create professional eBooks with our intuitive drag-and-drop editor. 
            No design experience needed.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="text-lg px-8 h-12 rounded-xl bg-slate-900 hover:bg-slate-800">
              Create New eBook
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 h-12 rounded-xl border-2 border-slate-300 hover:bg-slate-50"
            >
              Browse Templates
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            Everything you need to succeed
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature Card 1 */}
            <div className="group relative bg-white rounded-2xl p-12 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-slate-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-14 h-14 mb-6 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Palette className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  Drag & Drop Editor
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Intuitive visual editor. No design experience needed.
                </p>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="group relative bg-white rounded-2xl p-12 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-slate-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-14 h-14 mb-6 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  Professional Templates
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Start with beautiful, pre-designed templates.
                </p>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="group relative bg-white rounded-2xl p-12 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-slate-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-14 h-14 mb-6 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Download className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  Export to PDF
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  High-quality PDF export ready for distribution.
                </p>
              </div>
            </div>

            {/* Feature Card 4 */}
            <div className="group relative bg-white rounded-2xl p-12 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-slate-300">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-14 h-14 mb-6 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-7 w-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  Lightning Fast
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Create a complete eBook in under 30 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Create Something Amazing?
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                Join thousands of creators who are already using our platform to bring their ideas to life.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  className="text-lg px-12 h-12 rounded-xl bg-white text-slate-900 hover:bg-slate-100"
                >
                  Start Creating Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-12 h-12 rounded-xl border-2 border-white text-white hover:bg-white/10"
                >
                  View Examples
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-slate-600">
            <p>&copy; 2025 eBook Creator. Empowering creators worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
