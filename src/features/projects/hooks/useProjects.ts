
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Project, CreateProjectDTO } from '../types'
import { projectService } from '../services/projectService'

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchProjects = useCallback(async () => {
        try {
            setLoading(true)
            const data = await projectService.getProjects()
            setProjects(data)
            setError(null)
        } catch (err: any) {
            console.error('Error fetching projects:', err)
            setError(err.message || 'Failed to fetch projects')
        } finally {
            setLoading(false)
        }
    }, [])

    const createProject = async (dto: CreateProjectDTO) => {
        try {
            const newProject = await projectService.createProject(dto)
            setProjects((prev) => [newProject, ...prev])
            toast.success('Project created successfully')
            return newProject
        } catch (err: any) {
            console.error('Error creating project:', err)
            toast.error(err.message || 'Failed to create project')
            throw err
        }
    }

    const deleteProject = async (id: string) => {
        try {
            await projectService.deleteProject(id)
            setProjects((prev) => prev.filter((p) => p.id !== id))
            toast.success('Project deleted successfully')
        } catch (err: any) {
            console.error('Error deleting project:', err)
            toast.error(err.message || 'Failed to delete project')
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [fetchProjects])

    return {
        projects,
        loading,
        error,
        createProject,
        deleteProject,
        refresh: fetchProjects
    }
}
