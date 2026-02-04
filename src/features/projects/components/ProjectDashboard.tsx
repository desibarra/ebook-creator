
'use client'

import { useProjects } from '../hooks/useProjects'
import { ProjectCard } from './ProjectCard'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import Link from 'next/link'

export function ProjectDashboard() {
    const { projects, loading, error, deleteProject } = useProjects()

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center text-destructive p-4 border border-destructive/20 rounded-lg bg-destructive/10">
                <h3 className="font-semibold">Something went wrong</h3>
                <p>Error: {error}</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My eBooks</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your eBook projects or create a new one.
                    </p>
                </div>
                <Link href="/projects/new">
                    <Button size="lg" className="gap-2">
                        <Plus className="h-4 w-4" />
                        New eBook
                    </Button>
                </Link>
            </div>

            {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                        Get started by creating your first eBook project. It only takes a few seconds.
                    </p>
                    <Link href="/projects/new">
                        <Button size="lg" className="gap-2">
                            <Plus className="h-4 w-4" />
                            New eBook
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onDelete={deleteProject}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
