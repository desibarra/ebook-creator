
import { Block } from '@/features/projects/types'
import { useEditorStore } from '@/features/editor/store/useEditorStore'
import { cn } from '@/shared/lib/utils'
import { MarkdownBlock } from './MarkdownBlock'
import { RichTextEditor } from '../shared/RichTextEditor'

interface HeadingBlockProps {
    block: Block
}

export function HeadingBlock({ block }: HeadingBlockProps) {
    const updateBlock = useEditorStore((state) => state.updateBlock)
    const isSelected = useEditorStore((state) => state.selectedBlockId === block.id)
    const mode = useEditorStore((state) => state.mode)
    const isPreview = mode === 'preview'

    const level = block.properties?.level || 1
    const styles = {
        1: "text-4xl font-extrabold tracking-tight pt-2 pb-1 leading-tight",
        2: "text-3xl font-semibold tracking-tight pt-2 pb-1 leading-snug",
        3: "text-2xl font-semibold tracking-tight pt-2 pb-1 leading-normal"
    }

    if (isPreview || (!isSelected && block.content)) {
        // We use the level-specific heading logic from MarkdownBlock components if we wanted,
        // but simple h tag with project styles is fine too, or just MarkdownBlock with forced level.
        // If it's HTML, MarkdownBlock will handle it with rehype-raw.
        // If it was raw text, we prepend #. 
        // We'll check if it's HTML (starts with <)
        const isHtml = block.content.trim().startsWith('<')
        const content = isHtml ? block.content : '#'.repeat(level) + ' ' + block.content
        return <MarkdownBlock content={content} />
    }

    return (
        <div className={cn("w-full", styles[level as keyof typeof styles])}>
            <RichTextEditor
                content={block.content}
                onChange={(content) => updateBlock(block.id, { content })}
                placeholder={`Heading ${level}`}
                className="font-bold border-none p-0 focus:ring-0"
                useHtml={true}
                showToolbar={true} // Allow alignment and bold on titles
            />
        </div>
    )
}
