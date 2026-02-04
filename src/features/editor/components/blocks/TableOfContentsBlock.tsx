
'use client'

import { Block } from '@/features/projects/types'
import { useEditorStore } from '@/features/editor/store/useEditorStore'
import { RichTextEditor } from '../shared/RichTextEditor'
import { List } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface TableOfContentsBlockProps {
    block: Block
}

export function TableOfContentsBlock({ block }: TableOfContentsBlockProps) {
    const updateBlock = useEditorStore((state) => state.updateBlock)
    const isSelected = useEditorStore((state) => state.selectedBlockId === block.id)
    const mode = useEditorStore((state) => state.mode)
    const isPreview = mode === 'preview'

    const containerClasses = cn(
        "table-of-contents-block relative transition-all duration-200",
        !isPreview && isSelected && "is-editing"
    )

    if (isPreview || (!isSelected && block.content)) {
        return (
            <div className={containerClasses}>
                <div className="absolute -left-12 top-1 text-blue-500/50 print:hidden">
                    <List className="h-5 w-5" />
                </div>
                <div
                    className="table-of-contents-view prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                    style={{ fontSize: `${block.properties?.fontSize || 18}px` }}
                    dangerouslySetInnerHTML={{ __html: block.content }}
                />
            </div>
        )
    }

    return (
        <div className={containerClasses}>
            <div className="absolute -left-12 top-1.5 text-blue-500/30">
                <List className="h-6 w-6" />
            </div>
            <RichTextEditor
                content={block.content}
                onChange={(content) => updateBlock(block.id, { content })}
                placeholder="CONTENIDO\n\nCapítulo 1: Introducción\nCapítulo 2: Desarrollo..."
                fontSize={block.properties?.fontSize || 18}
                onFontSizeChange={(size) => updateBlock(block.id, {
                    properties: { ...block.properties, fontSize: size }
                })}
                className="font-sans leading-relaxed"
                useHtml={true}
            />
        </div>
    )
}
