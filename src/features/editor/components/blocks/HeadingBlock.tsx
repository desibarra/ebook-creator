
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
    const fontSizeMap = {
        1: 36, // text-4xl
        2: 30, // text-3xl
        3: 24  // text-2xl
    }
    const styles = {
        1: "text-4xl font-extrabold tracking-tight pt-4 pb-2 leading-tight text-slate-900 dark:text-white",
        2: "text-3xl font-bold tracking-tight pt-3 pb-2 leading-snug text-slate-800 dark:text-slate-100",
        3: "text-2xl font-bold tracking-tight pt-2 pb-1 leading-normal text-slate-800 dark:text-slate-200"
    }

    if (isPreview || (!isSelected && block.content)) {
        // Modo lectura: Limpiamos HTML y forzamos Markdown Headline
        const cleanContent = block.content.replace(/<\/?p>/g, '').trim()
        const markdownContent = '#'.repeat(level) + ' ' + cleanContent

        return (
            <div className={cn(
                "w-full mb-6",
                (block.properties?.align === 'center' || !block.properties?.align) ? "text-center" :
                    block.properties?.align === 'right' ? "text-right" : "text-left"
            )}>
                <MarkdownBlock content={markdownContent} />
            </div>
        )
    }

    return (
        <div
            className={cn(
                "w-full transition-all duration-300 rounded-lg border border-transparent hover:border-slate-100 p-2",
                styles[level as keyof typeof styles],
                (block.properties?.align === 'center' || !block.properties?.align) ? "text-center" :
                    block.properties?.align === 'right' ? "text-right" : "text-left"
            )}
        >
            <RichTextEditor
                content={block.content}
                onChange={(content) => updateBlock(block.id, { content })}
                placeholder={`Título nivel ${level}...`}
                fontSize={fontSizeMap[level as keyof typeof fontSizeMap]}
                className="font-inherit border-none p-0 focus:ring-0 bg-transparent"
                useHtml={true}
                showToolbar={false}
            />
        </div>
    )
}
