
import { Project, Block, ProjectContent } from '@/features/projects/types'

export type EditorMode = 'edit' | 'preview'

export interface EditorState {
    project: Project | null
    blocks: Block[]
    selectedBlockId: string | null
    mode: EditorMode
    viewMode: 'normal' | 'print'
    history: {
        past: ProjectContent[]
        future: ProjectContent[]
    }
}

export interface EditorActions {
    setProject: (project: Project) => void
    addBlock: (type: Block['type'], initialData?: Partial<Block>, index?: number) => void
    addBlocks: (blocks: Block[]) => void
    updateBlock: (id: string, updates: Partial<Block>) => void
    deleteBlock: (id: string) => void
    reorderBlocks: (fromIndex: number, toIndex: number) => void
    selectBlock: (id: string | null) => void
    setMode: (mode: EditorMode) => void
    setViewMode: (viewMode: 'normal' | 'print') => void
    undo: () => void
    redo: () => void
    save: (silent?: boolean) => Promise<void>
}
