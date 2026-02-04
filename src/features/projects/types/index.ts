
export type Project = {
  id: string
  user_id: string
  title: string
  content: ProjectContent
  thumbnail_url: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type ProjectContent = {
  blocks: Block[]
  version: number
  settings?: ProjectSettings
  generationParams?: {
    topic?: string
    audience?: string
    purpose?: string
    tone?: string
  }
}

export type ProjectSettings = {
  pageSize?: 'a4' | 'letter' | '6x9'
  orientation?: 'portrait' | 'landscape'
  margins?: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export type BlockType = 'text' | 'heading' | 'image' | 'divider' | 'spacer' | 'page-break' | 'table-of-contents' | 'cover'

export type Block = {
  id: string
  type: BlockType
  content: string
  properties?: Record<string, any>
}

export type CreateProjectDTO = {
  title: string
  description?: string
  topic?: string
  audience?: string
  purpose?: string
  tone?: string
}

export type UpdateProjectDTO = Partial<Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>>
