
import { Block } from '@/features/projects/types'
import { useEditorStore } from '@/features/editor/store/useEditorStore'
import { MarkdownBlock } from './MarkdownBlock'
import { RichTextEditor } from '../shared/RichTextEditor'

interface TextBlockProps {
    block: Block
}

export function TextBlock({ block }: TextBlockProps) {
    const updateBlock = useEditorStore((state) => state.updateBlock)
    const isSelected = useEditorStore((state) => state.selectedBlockId === block.id)
    const mode = useEditorStore((state) => state.mode)
    const isPreview = mode === 'preview'

    if (isPreview || (!isSelected && block.content)) {
        return <MarkdownBlock content={block.content} fontSize={block.properties?.fontSize} />
    }

    return (
        <RichTextEditor
            content={block.content}
            onChange={(content) => updateBlock(block.id, { content })}
            placeholder="Escribe o pega tu contenido aquí..."
            fontSize={block.properties?.fontSize || 16}
            onFontSizeChange={(size) => updateBlock(block.id, {
                properties: { ...block.properties, fontSize: size }
            })}
            className="font-serif"
            useHtml={true}
        />
    )
}
