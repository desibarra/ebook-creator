
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { MoreVertical, Pencil, Trash2, FileText } from 'lucide-react'
import { Project } from '../types'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

interface ProjectCardProps {
    project: Project
    onDelete: (id: string) => void
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
    return (
        <Card className="group relative transition-all hover:shadow-md">
            <Link href={`/editor/${project.id}`} className="absolute inset-0 z-0">
                <span className="sr-only">Open project</span>
            </Link>

            <div className="aspect-[3/4] w-full bg-muted flex items-center justify-center rounded-t-lg border-b overflow-hidden relative">
                {project.thumbnail_url ? (
                    <img
                        src={project.thumbnail_url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center text-muted-foreground/50">
                        <FileText className="h-12 w-12 mb-2" />
                        <span className="text-xs uppercase font-semibold">No Preview</span>
                    </div>
                )}
            </div>

            <CardHeader className="p-4 space-y-1">
                <div className="flex items-start justify-between gap-2 z-10">
                    <CardTitle className="truncate font-semibold text-base" title={project.title}>
                        {project.title}
                    </CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/editor/${project.id}`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDelete(project.id)
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                Edited {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}
            </CardFooter>
        </Card>
    )
}
