
import { ReactNode } from 'react'
import Link from 'next/link'
import { BookOpen, LogOut } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { createClient } from '@/shared/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const signOut = async () => {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg hover:text-primary transition-colors">
                        <BookOpen className="h-6 w-6 text-primary" />
                        <span>eBook Creator</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:inline-block">
                            {user.email}
                        </span>
                        <form action={signOut}>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </form>
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}
