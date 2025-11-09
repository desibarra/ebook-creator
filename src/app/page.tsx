import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { BookOpen, Palette, Download, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <h1 className="text-xl font-bold">eBook Creator</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold tracking-tight mb-6">
          Create Professional eBooks
          <br />
          <span className="text-primary">Without Design Skills</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Simple drag & drop editor for marketers, coaches, and content creators.
          Build beautiful eBooks in minutes, not hours.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" className="text-lg px-8">
              Start Creating Free
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-8">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center mb-12">Everything You Need</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Palette className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Drag & Drop Editor</CardTitle>
              <CardDescription>
                Intuitive visual editor. No design experience needed.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Professional Templates</CardTitle>
              <CardDescription>
                Start with beautiful, pre-designed templates.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Download className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Export to PDF</CardTitle>
              <CardDescription>
                High-quality PDF export ready for distribution.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Create a complete eBook in under 30 minutes.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="text-center p-12 bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-3xl mb-4">Ready to Create Your First eBook?</CardTitle>
            <CardDescription className="text-primary-foreground/80 text-lg">
              Join thousands of creators who are already using our platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-12">
                Get Started Free
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 eBook Creator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
