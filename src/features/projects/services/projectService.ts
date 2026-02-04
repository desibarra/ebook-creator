
import { createClient } from '@/shared/lib/supabase/client'
import type { Project, CreateProjectDTO } from '../types'

import { nanoid } from 'nanoid'

export const projectService = {
    async getProjects() {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .is('deleted_at', null)
            .order('updated_at', { ascending: false })

        if (error) throw error
        return data as Project[]
    },

    async createProject(project: CreateProjectDTO) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) throw new Error('User not authenticated')

        const initialBlocks = [
            {
                id: nanoid(),
                type: 'cover' as const,
                content: project.title,
                properties: {
                    subtitle: '',
                    author: user.user_metadata?.full_name || '',
                    coverImage: null
                }
            },
            {
                id: nanoid(),
                type: 'copyright' as const,
                content: '',
                properties: {
                    year: new Date().getFullYear(),
                    author: user.user_metadata?.full_name || '',
                    isbn: ''
                }
            },
            {
                id: nanoid(),
                type: 'table-of-contents' as const,
                content: '<h2>CONTENIDO</h2>',
                properties: {
                    fontSize: 18
                }
            }
        ]

        const newProject = {
            user_id: user.id,
            title: project.title,
            content: {
                version: 1,
                blocks: initialBlocks,
                settings: {
                    pageSize: 'a4',
                    orientation: 'portrait',
                    margins: { top: 20, bottom: 20, left: 20, right: 20 }
                },
                generationParams: {
                    topic: project.topic,
                    audience: project.audience,
                    purpose: project.purpose,
                    tone: project.tone
                }
            }
        }

        const { data, error } = await supabase
            .from('projects')
            .insert(newProject)
            .select()
            .single()

        if (error) throw error
        return data as Project
    },

    async deleteProject(id: string) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const query = supabase
            .from('projects')
            .delete()
            .eq('id', id)

        if (user) {
            query.eq('user_id', user.id)
        }

        const { error } = await query

        if (error) throw error
        return true
    },

    async getProjectById(id: string) {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data as Project
    },

    async generateProjectContent(projectId: string) {
        const response = await fetch('/api/ai/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ projectId }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to generate content');
        }

        return await response.json();
    }
}
