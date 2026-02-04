
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { Project, Block, ProjectContent } from '@/features/projects/types'
import { EditorState, EditorActions, EditorMode } from '../types'
import { projectService } from '@/features/projects/services/projectService'
import { toast } from 'sonner'
import { createClient } from '@/shared/lib/supabase/client'

interface Store extends EditorState, EditorActions { }

const defaultContent: ProjectContent = {
    version: 1,
    blocks: [],
}

export const useEditorStore = create<Store>()(
    devtools((set, get) => ({
        project: null,
        blocks: [],
        selectedBlockId: null,
        mode: 'edit',
        viewMode: 'print',
        history: {
            past: [],
            future: [],
        },

        setViewMode: (viewMode: 'normal' | 'print') => set({ viewMode }),

        setProject: (project: Project) => {
            // Hydrate from content
            const content = project.content || defaultContent
            set({
                project,
                blocks: content.blocks || [],
                history: { past: [], future: [] }
            })
        },

        addBlock: (type: Block['type'], initialData?: Partial<Block>, index?: number) => {
            const newBlock: Block = {
                id: nanoid(),
                type,
                content: initialData?.content || '',
                properties: initialData?.properties || {}
            }

            set((state) => {
                const newBlocks = [...state.blocks]
                let insertIndex = index

                if (insertIndex === undefined) {
                    if (state.selectedBlockId) {
                        const selectedIdx = newBlocks.findIndex(b => b.id === state.selectedBlockId)
                        insertIndex = selectedIdx !== -1 ? selectedIdx + 1 : newBlocks.length
                    } else {
                        insertIndex = newBlocks.length
                    }
                }

                newBlocks.splice(insertIndex, 0, newBlock)

                // Push to history
                const currentState = {
                    version: 1,
                    blocks: state.blocks
                }

                return {
                    blocks: newBlocks,
                    selectedBlockId: newBlock.id,
                    history: {
                        past: [...state.history.past, currentState],
                        future: []
                    }
                }
            })
        },

        addBlocks: (newBlocksData: Block[], index?: number) => {
            set((state) => {
                const newBlocks = [...state.blocks]
                let insertIndex = index

                if (insertIndex === undefined) {
                    if (state.selectedBlockId) {
                        const selectedIdx = newBlocks.findIndex(b => b.id === state.selectedBlockId)
                        insertIndex = selectedIdx !== -1 ? selectedIdx + 1 : newBlocks.length
                    } else {
                        insertIndex = newBlocks.length
                    }
                }

                newBlocks.splice(insertIndex, 0, ...newBlocksData)

                const currentState = {
                    version: 1,
                    blocks: state.blocks
                }

                return {
                    blocks: newBlocks,
                    history: {
                        past: [...state.history.past, currentState],
                        future: []
                    }
                }
            })
        },

        updateBlock: (id: string, updates: Partial<Block>) => {
            set((state) => {
                // Push to history ONLY on significant change (debounce handled in UI usually, but here simple)
                // For frequent updates, we might need a separate optimized store or debouncing.
                // For now, simple implementation.

                const newBlocks = state.blocks.map(b =>
                    b.id === id ? { ...b, ...updates } : b
                )

                return { blocks: newBlocks }
            })
        },

        deleteBlock: (id: string) => {
            set((state) => {
                const currentState = {
                    version: 1,
                    blocks: state.blocks
                }
                return {
                    blocks: state.blocks.filter(b => b.id !== id),
                    selectedBlockId: null,
                    history: {
                        past: [...state.history.past, currentState],
                        future: []
                    }
                }
            })
        },

        reorderBlocks: (fromIndex: number, toIndex: number) => {
            set((state) => {
                const currentState = {
                    version: 1,
                    blocks: state.blocks
                }
                const newBlocks = [...state.blocks]
                const [movedBlock] = newBlocks.splice(fromIndex, 1)
                newBlocks.splice(toIndex, 0, movedBlock)

                return {
                    blocks: newBlocks,
                    history: {
                        past: [...state.history.past, currentState],
                        future: []
                    }
                }
            })
        },

        selectBlock: (id: string | null) => set({ selectedBlockId: id }),
        setMode: (mode: EditorMode) => set({ mode }),

        undo: () => {
            set((state) => {
                if (state.history.past.length === 0) return state

                const previousState = state.history.past[state.history.past.length - 1]
                const newPast = state.history.past.slice(0, -1)

                const currentState = {
                    version: 1,
                    blocks: state.blocks
                }

                return {
                    blocks: previousState.blocks,
                    history: {
                        past: newPast,
                        future: [currentState, ...state.history.future]
                    }
                }
            })
        },

        redo: () => {
            set((state) => {
                if (state.history.future.length === 0) return state

                const nextState = state.history.future[0]
                const newFuture = state.history.future.slice(1)

                const currentState = {
                    version: 1,
                    blocks: state.blocks
                }

                return {
                    blocks: nextState.blocks,
                    history: {
                        past: [...state.history.past, currentState],
                        future: newFuture
                    }
                }
            })
        },

        save: async (silent = false) => {
            const state = get()
            if (!state.project) return

            const content: ProjectContent = {
                version: 1,
                blocks: state.blocks,
                settings: state.project.content.settings
            }

            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) return // Don't crash if not logged in during auto-save

                const { error } = await supabase
                    .from('projects')
                    .update({
                        content: content as any,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', state.project.id)
                    .eq('user_id', user.id)

                if (error) throw error

                if (!silent) {
                    toast.success('Project saved')
                }
            } catch (error: any) {
                // Ignore background fetch errors (could be transient network issues)
                if (!silent) {
                    console.error('Save failed:', error)
                    toast.error(error.message || 'Failed to save project')
                }
            }
        }
    }))
)
